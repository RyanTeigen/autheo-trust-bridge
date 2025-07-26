-- Fix the process_appointment_access_request function to use correct search path
CREATE OR REPLACE FUNCTION public.process_appointment_access_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  patient_prefs public.patient_consent_preferences%ROWTYPE;
  should_auto_approve BOOLEAN := FALSE;
  access_duration INTEGER := 24;
  access_expiry TIMESTAMP WITH TIME ZONE;
  data_type_mapping RECORD;
  provider_name TEXT;
BEGIN
  -- Get patient consent preferences
  SELECT * INTO patient_prefs 
  FROM public.patient_consent_preferences 
  WHERE patient_id = NEW.patient_id;
  
  -- If no preferences exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.patient_consent_preferences (patient_id)
    VALUES (NEW.patient_id)
    RETURNING * INTO patient_prefs;
  END IF;
  
  -- Get provider name for notification
  SELECT COALESCE(CONCAT(first_name, ' ', last_name), email) INTO provider_name
  FROM public.profiles 
  WHERE id = NEW.provider_id;
  
  -- Get data type mapping for this appointment type
  SELECT * INTO data_type_mapping
  FROM public.appointment_data_type_mappings
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
  
  -- Update appointment status
  IF should_auto_approve THEN
    NEW.access_request_status := 'auto_approved';
    NEW.access_granted_at := NOW();
    NEW.access_expires_at := access_expiry;
  END IF;
  
  RETURN NEW;
END;
$$;