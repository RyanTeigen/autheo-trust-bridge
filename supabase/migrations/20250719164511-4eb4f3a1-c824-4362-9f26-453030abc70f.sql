
-- Create appointment_access_mappings table
CREATE TABLE public.appointment_access_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  access_granted BOOLEAN DEFAULT FALSE,
  access_duration_hours INTEGER DEFAULT 24,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  clinical_justification TEXT,
  auto_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_consent_preferences table
CREATE TABLE public.patient_consent_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  auto_approve_appointments BOOLEAN DEFAULT FALSE,
  default_access_duration_hours INTEGER DEFAULT 24,
  trusted_providers UUID[] DEFAULT ARRAY[]::UUID[],
  appointment_types_auto_approve TEXT[] DEFAULT ARRAY[]::TEXT[],
  emergency_auto_approve BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id)
);

-- Create enhanced_appointments table for better appointment tracking
CREATE TABLE public.enhanced_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('normal', 'urgent', 'emergency')),
  clinical_notes TEXT,
  access_request_status TEXT DEFAULT 'pending' CHECK (access_request_status IN ('pending', 'auto_approved', 'manually_approved', 'denied')),
  access_granted_at TIMESTAMP WITH TIME ZONE,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointment_audit_trail table
CREATE TABLE public.appointment_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES enhanced_appointments(id) ON DELETE CASCADE,
  mapping_id UUID REFERENCES appointment_access_mappings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.appointment_access_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointment_access_mappings
CREATE POLICY "Patients can view their appointment access mappings"
  ON appointment_access_mappings FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view mappings for their appointments"
  ON appointment_access_mappings FOR SELECT
  USING (provider_id = auth.uid());

CREATE POLICY "System can manage appointment access mappings"
  ON appointment_access_mappings FOR ALL
  USING (true);

-- RLS Policies for patient_consent_preferences
CREATE POLICY "Patients can manage their consent preferences"
  ON patient_consent_preferences FOR ALL
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- RLS Policies for enhanced_appointments
CREATE POLICY "Patients can view their appointments"
  ON enhanced_appointments FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view their appointments"
  ON enhanced_appointments FOR SELECT
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can create appointments"
  ON enhanced_appointments FOR INSERT
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their appointments"
  ON enhanced_appointments FOR UPDATE
  USING (provider_id = auth.uid());

-- RLS Policies for appointment_audit_trail
CREATE POLICY "Users can view audit trail for their appointments"
  ON appointment_audit_trail FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM enhanced_appointments 
      WHERE patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
      OR provider_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit trail"
  ON appointment_audit_trail FOR INSERT
  WITH CHECK (true);

-- Create function to automatically process appointment access requests
CREATE OR REPLACE FUNCTION public.process_appointment_access_request()
RETURNS TRIGGER AS $$
DECLARE
  patient_prefs patient_consent_preferences%ROWTYPE;
  should_auto_approve BOOLEAN := FALSE;
  access_duration INTEGER := 24;
  access_expiry TIMESTAMP WITH TIME ZONE;
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
      'appointment_type', NEW.appointment_type
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment access processing
CREATE TRIGGER process_appointment_access_on_insert
  AFTER INSERT ON enhanced_appointments
  FOR EACH ROW
  EXECUTE FUNCTION process_appointment_access_request();

-- Create function to update appointment access mappings
CREATE OR REPLACE FUNCTION public.update_appointment_access_mappings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_appointment_access_mappings_updated_at
  BEFORE UPDATE ON appointment_access_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_access_mappings();

CREATE TRIGGER update_patient_consent_preferences_updated_at
  BEFORE UPDATE ON patient_consent_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_access_mappings();

CREATE TRIGGER update_enhanced_appointments_updated_at
  BEFORE UPDATE ON enhanced_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_access_mappings();
