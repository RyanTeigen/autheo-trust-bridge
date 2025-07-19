
-- Create appointment_data_type_mappings table to map appointment types to required data types
CREATE TABLE public.appointment_data_type_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_type TEXT NOT NULL,
  required_data_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  access_justification TEXT,
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default mappings for common appointment types
INSERT INTO appointment_data_type_mappings (appointment_type, required_data_types, access_justification, priority_level) VALUES
('Annual Physical', ARRAY['vital_signs', 'medical_history', 'lab_results', 'medications', 'allergies'], 'Comprehensive health assessment requires access to complete medical history', 'normal'),
('Follow-up', ARRAY['recent_lab_results', 'medications', 'treatment_notes'], 'Follow-up care requires recent medical data and current treatments', 'normal'),
('Emergency', ARRAY['medical_history', 'allergies', 'medications', 'emergency_contacts', 'vital_signs'], 'Emergency care requires immediate access to critical medical information', 'urgent'),
('Specialist Consultation', ARRAY['referral_notes', 'relevant_test_results', 'medical_history', 'medications'], 'Specialist consultation requires targeted medical information', 'high'),
('Lab Work', ARRAY['lab_orders', 'previous_lab_results'], 'Laboratory work requires previous results for comparison', 'low'),
('Vaccination', ARRAY['vaccination_history', 'allergies'], 'Vaccination requires allergy information and previous vaccination records', 'normal'),
('Mental Health', ARRAY['mental_health_history', 'medications', 'treatment_notes'], 'Mental health care requires specialized medical history', 'high'),
('Cardiology', ARRAY['cardiovascular_history', 'medications', 'vital_signs', 'ecg_results'], 'Cardiology consultation requires heart-related medical data', 'high'),
('Telehealth', ARRAY['recent_notes', 'medications', 'vital_signs'], 'Remote consultation requires current medical status', 'normal');

-- Enable RLS on the new table
ALTER TABLE public.appointment_data_type_mappings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read appointment data type mappings (they're not patient-specific)
CREATE POLICY "Anyone can read appointment data type mappings"
  ON appointment_data_type_mappings FOR SELECT
  USING (true);

-- Only admins can modify appointment data type mappings
CREATE POLICY "Only admins can modify appointment data type mappings"
  ON appointment_data_type_mappings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ));

-- Update the appointment access processing function to create detailed notifications
CREATE OR REPLACE FUNCTION public.process_appointment_access_request()
RETURNS TRIGGER AS $$
DECLARE
  patient_prefs patient_consent_preferences%ROWTYPE;
  should_auto_approve BOOLEAN := FALSE;
  access_duration INTEGER := 24;
  access_expiry TIMESTAMP WITH TIME ZONE;
  data_type_mapping RECORD;
  provider_name TEXT;
BEGIN
  -- Get patient consent preferences
  SELECT * INTO patient_prefs 
  FROM patient_consent_preferences 
  WHERE patient_id = NEW.patient_id;
  
  -- If no preferences exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO patient_consent_preferences (patient_id)
    VALUES (NEW.patient_id)
    RETURNING * INTO patient_prefs;
  END IF;
  
  -- Get provider name for notification
  SELECT COALESCE(full_name, CONCAT(first_name, ' ', last_name), email) INTO provider_name
  FROM profiles 
  WHERE id = NEW.provider_id;
  
  -- Get data type mapping for this appointment type
  SELECT * INTO data_type_mapping
  FROM appointment_data_type_mappings
  WHERE appointment_type = NEW.appointment_type;
  
  -- Determine if should auto-approve
  should_auto_approve := (
    patient_prefs.auto_approve_appointments = TRUE AND
    (
      NEW.urgency_level = 'emergency' AND patient_prefs.emergency_auto_approve = TRUE
      OR NEW.provider_id = ANY(patient_prefs.trusted_providers)
      OR NEW.appointment_type = ANY(patient_prefs.appointment_types_auto_approve)
    )
  );
  
  -- Set access duration
  access_duration := COALESCE(patient_prefs.default_access_duration_hours, 24);
  access_expiry := NEW.appointment_date + (access_duration || ' hours')::INTERVAL;
  
  -- Create appointment access mapping
  INSERT INTO appointment_access_mappings (
    appointment_id,
    patient_id,
    provider_id,
    access_granted,
    access_duration_hours,
    access_expires_at,
    clinical_justification,
    auto_granted
  ) VALUES (
    NEW.id,
    NEW.patient_id,
    NEW.provider_id,
    should_auto_approve,
    access_duration,
    access_expiry,
    NEW.clinical_notes,
    should_auto_approve
  );
  
  -- Update appointment status
  IF should_auto_approve THEN
    NEW.access_request_status := 'auto_approved';
    NEW.access_granted_at := NOW();
    NEW.access_expires_at := access_expiry;
    
    -- Create sharing permission if auto-approved
    INSERT INTO sharing_permissions (
      patient_id,
      grantee_id,
      medical_record_id,
      permission_type,
      status,
      expires_at,
      created_at,
      updated_at
    )
    SELECT 
      NEW.patient_id,
      NEW.provider_id,
      mr.id,
      'read',
      'approved',
      access_expiry,
      NOW(),
      NOW()
    FROM medical_records mr 
    WHERE mr.patient_id = NEW.patient_id
    AND NOT EXISTS (
      SELECT 1 FROM sharing_permissions sp 
      WHERE sp.patient_id = NEW.patient_id 
      AND sp.grantee_id = NEW.provider_id 
      AND sp.medical_record_id = mr.id
      AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    );
    
    -- Create auto-approval notification
    INSERT INTO patient_notifications (
      patient_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.patient_id,
      'access_auto_approved',
      '🔓 Medical Records Access Auto-Approved',
      CASE 
        WHEN data_type_mapping.required_data_types IS NOT NULL THEN
          format('Your upcoming %s appointment with %s on %s has been automatically granted access to: %s. Access expires %s hours after your appointment.',
            NEW.appointment_type,
            COALESCE(provider_name, 'your provider'),
            TO_CHAR(NEW.appointment_date, 'Mon DD, YYYY at HH12:MI AM'),
            array_to_string(data_type_mapping.required_data_types, ', '),
            access_duration
          )
        ELSE
          format('Your upcoming %s appointment with %s on %s has been automatically granted access to your medical records. Access expires %s hours after your appointment.',
            NEW.appointment_type,
            COALESCE(provider_name, 'your provider'),
            TO_CHAR(NEW.appointment_date, 'Mon DD, YYYY at HH12:MI AM'),
            access_duration
          )
      END,
      CASE 
        WHEN NEW.urgency_level = 'emergency' THEN 'urgent'
        WHEN NEW.urgency_level = 'urgent' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'provider_id', NEW.provider_id,
        'provider_name', provider_name,
        'appointment_type', NEW.appointment_type,
        'appointment_date', NEW.appointment_date,
        'access_duration_hours', access_duration,
        'required_data_types', COALESCE(data_type_mapping.required_data_types, ARRAY[]::TEXT[]),
        'access_justification', COALESCE(data_type_mapping.access_justification, ''),
        'auto_approved', true
      ),
      NOW()
    );
  ELSE
    -- Create access request notification for manual approval
    INSERT INTO patient_notifications (
      patient_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at,
      expires_at
    ) VALUES (
      NEW.patient_id,
      'appointment_access_request',
      '🏥 Medical Records Access Request',
      CASE 
        WHEN data_type_mapping.required_data_types IS NOT NULL THEN
          format('%s is requesting access to specific medical data for your %s appointment on %s. Required data: %s. %s Please review and approve within 24 hours.',
            COALESCE(provider_name, 'Your healthcare provider'),
            NEW.appointment_type,
            TO_CHAR(NEW.appointment_date, 'Mon DD, YYYY at HH12:MI AM'),
            array_to_string(data_type_mapping.required_data_types, ', '),
            COALESCE(data_type_mapping.access_justification, '')
          )
        ELSE
          format('%s is requesting access to your medical records for your %s appointment on %s. Please review and approve within 24 hours.',
            COALESCE(provider_name, 'Your healthcare provider'),
            NEW.appointment_type,
            TO_CHAR(NEW.appointment_date, 'Mon DD, YYYY at HH12:MI AM')
          )
      END,
      CASE 
        WHEN NEW.urgency_level = 'emergency' THEN 'urgent'
        WHEN NEW.urgency_level = 'urgent' THEN 'high'
        WHEN data_type_mapping.priority_level = 'high' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'provider_id', NEW.provider_id,
        'provider_name', provider_name,
        'appointment_type', NEW.appointment_type,
        'appointment_date', NEW.appointment_date,
        'access_duration_hours', access_duration,
        'required_data_types', COALESCE(data_type_mapping.required_data_types, ARRAY[]::TEXT[]),
        'access_justification', COALESCE(data_type_mapping.access_justification, ''),
        'clinical_justification', NEW.clinical_notes,
        'urgency_level', NEW.urgency_level,
        'auto_approved', false
      ),
      NOW(),
      NEW.appointment_date - INTERVAL '1 hour' -- Expire 1 hour before appointment
    );
  END IF;
  
  -- Insert audit trail
  INSERT INTO appointment_audit_trail (
    appointment_id,
    action,
    performed_by,
    details
  ) VALUES (
    NEW.id,
    CASE WHEN should_auto_approve THEN 'AUTO_APPROVED' ELSE 'ACCESS_REQUESTED' END,
    NEW.provider_id,
    jsonb_build_object(
      'auto_approved', should_auto_approve,
      'access_duration_hours', access_duration,
      'urgency_level', NEW.urgency_level,
      'appointment_type', NEW.appointment_type,
      'required_data_types', COALESCE(data_type_mapping.required_data_types, ARRAY[]::TEXT[]),
      'notification_created', true
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for appointment_data_type_mappings
CREATE TRIGGER update_appointment_data_type_mappings_updated_at
  BEFORE UPDATE ON appointment_data_type_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_access_mappings();
