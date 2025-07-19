
-- Create function to handle appointment access request approval/denial
CREATE OR REPLACE FUNCTION public.respond_to_appointment_access_request(
  appointment_id_param uuid,
  decision_param text, -- 'approve' or 'deny'
  note_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record enhanced_appointments%ROWTYPE;
  patient_record patients%ROWTYPE;
  access_duration INTEGER := 24;
  access_expiry TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  -- Validate decision parameter
  IF decision_param NOT IN ('approve', 'deny') THEN
    RAISE EXCEPTION 'Invalid decision. Must be "approve" or "deny"';
  END IF;

  -- Get appointment record
  SELECT * INTO appointment_record
  FROM enhanced_appointments
  WHERE id = appointment_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  -- Get patient record to verify ownership
  SELECT * INTO patient_record
  FROM patients
  WHERE id = appointment_record.patient_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: Not your appointment';
  END IF;

  -- Calculate access expiry
  access_expiry := appointment_record.appointment_date + (access_duration || ' hours')::INTERVAL;

  IF decision_param = 'approve' THEN
    -- Update appointment status
    UPDATE enhanced_appointments
    SET 
      access_request_status = 'approved',
      access_granted_at = NOW(),
      access_expires_at = access_expiry,
      updated_at = NOW()
    WHERE id = appointment_id_param;

    -- Create sharing permissions for all patient's medical records
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
      appointment_record.patient_id,
      appointment_record.provider_id,
      mr.id,
      'read',
      'approved',
      access_expiry,
      NOW(),
      NOW()
    FROM medical_records mr 
    WHERE mr.patient_id = appointment_record.patient_id
    AND NOT EXISTS (
      SELECT 1 FROM sharing_permissions sp 
      WHERE sp.patient_id = appointment_record.patient_id 
      AND sp.grantee_id = appointment_record.provider_id 
      AND sp.medical_record_id = mr.id
      AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    );

    -- Update appointment access mapping
    UPDATE appointment_access_mappings
    SET 
      access_granted = true,
      updated_at = NOW()
    WHERE appointment_id = appointment_id_param;

    result := jsonb_build_object(
      'success', true,
      'message', 'Access request approved successfully',
      'access_expires_at', access_expiry
    );

  ELSE -- deny
    -- Update appointment status
    UPDATE enhanced_appointments
    SET 
      access_request_status = 'denied',
      updated_at = NOW()
    WHERE id = appointment_id_param;

    -- Update appointment access mapping
    UPDATE appointment_access_mappings
    SET 
      access_granted = false,
      updated_at = NOW()
    WHERE appointment_id = appointment_id_param;

    result := jsonb_build_object(
      'success', true,
      'message', 'Access request denied'
    );
  END IF;

  -- Insert audit trail
  INSERT INTO appointment_audit_trail (
    appointment_id,
    action,
    performed_by,
    details
  ) VALUES (
    appointment_id_param,
    UPPER(decision_param) || '_ACCESS_REQUEST',
    auth.uid(),
    jsonb_build_object(
      'decision', decision_param,
      'note', note_param,
      'processed_at', NOW(),
      'access_duration_hours', CASE WHEN decision_param = 'approve' THEN access_duration ELSE NULL END
    )
  );

  -- Mark related notifications as read
  UPDATE patient_notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE patient_id = appointment_record.patient_id
  AND notification_type IN ('appointment_access_request')
  AND (data->>'appointment_id')::uuid = appointment_id_param;

  RETURN result;
END;
$$;

-- Create function to get appointment details with access request info
CREATE OR REPLACE FUNCTION public.get_appointment_details(appointment_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record RECORD;
  provider_info RECORD;
  data_type_mapping RECORD;
  result jsonb;
BEGIN
  -- Get appointment with access mapping
  SELECT 
    ea.*,
    aam.access_granted,
    aam.access_duration_hours,
    aam.clinical_justification,
    aam.auto_granted
  INTO appointment_record
  FROM enhanced_appointments ea
  LEFT JOIN appointment_access_mappings aam ON ea.id = aam.appointment_id
  WHERE ea.id = appointment_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  -- Verify patient ownership
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = appointment_record.patient_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Not your appointment';
  END IF;

  -- Get provider information
  SELECT 
    COALESCE(full_name, CONCAT(first_name, ' ', last_name), email) as name,
    email,
    first_name,
    last_name
  INTO provider_info
  FROM profiles
  WHERE id = appointment_record.provider_id;

  -- Get data type mapping
  SELECT * INTO data_type_mapping
  FROM appointment_data_type_mappings
  WHERE appointment_type = appointment_record.appointment_type;

  -- Build result
  result := jsonb_build_object(
    'appointment', jsonb_build_object(
      'id', appointment_record.id,
      'appointment_type', appointment_record.appointment_type,
      'appointment_date', appointment_record.appointment_date,
      'status', appointment_record.status,
      'urgency_level', appointment_record.urgency_level,
      'clinical_notes', appointment_record.clinical_notes,
      'access_request_status', appointment_record.access_request_status,
      'access_granted_at', appointment_record.access_granted_at,
      'access_expires_at', appointment_record.access_expires_at
    ),
    'provider', jsonb_build_object(
      'id', appointment_record.provider_id,
      'name', COALESCE(provider_info.name, 'Unknown Provider'),
      'email', provider_info.email
    ),
    'access_info', jsonb_build_object(
      'access_granted', COALESCE(appointment_record.access_granted, false),
      'access_duration_hours', COALESCE(appointment_record.access_duration_hours, 24),
      'clinical_justification', appointment_record.clinical_justification,
      'auto_granted', COALESCE(appointment_record.auto_granted, false)
    ),
    'data_requirements', CASE 
      WHEN data_type_mapping.required_data_types IS NOT NULL THEN
        jsonb_build_object(
          'required_data_types', to_jsonb(data_type_mapping.required_data_types),
          'access_justification', data_type_mapping.access_justification,
          'priority_level', data_type_mapping.priority_level
        )
      ELSE
        jsonb_build_object(
          'required_data_types', '[]'::jsonb,
          'access_justification', null,
          'priority_level', 'normal'
        )
    END
  );

  RETURN result;
END;
$$;
