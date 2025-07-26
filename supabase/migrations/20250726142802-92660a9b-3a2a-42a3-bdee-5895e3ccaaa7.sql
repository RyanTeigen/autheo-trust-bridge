-- Fix security definer functions with proper search path settings
-- Update existing functions to include secure search path

CREATE OR REPLACE FUNCTION public.process_appointment_access_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  SELECT COALESCE(CONCAT(first_name, ' ', last_name), email) INTO provider_name
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
  
  -- Update appointment status
  IF should_auto_approve THEN
    NEW.access_request_status := 'auto_approved';
    NEW.access_granted_at := NOW();
    NEW.access_expires_at := access_expiry;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix create_sharing_permission_notification function
CREATE OR REPLACE FUNCTION public.create_sharing_permission_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  patient_name TEXT;
  provider_name TEXT;
BEGIN
  -- Only create notification if status changed to approved or denied
  IF NEW.status IN ('approved', 'rejected') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name for context
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.grantee_id;
    
    -- Insert notification for the provider (grantee)
    INSERT INTO provider_notifications (
      provider_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.grantee_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'access_granted'
        ELSE 'access_denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN '✅ Access Request Approved'
        ELSE '❌ Access Request Denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 
          format('Patient %s has approved your access request. You can now view their medical records.',
            COALESCE(patient_name, 'Unknown Patient'))
        ELSE 
          format('Patient %s has denied your access request for medical records.',
            COALESCE(patient_name, 'Unknown Patient'))
      END,
      'normal',
      jsonb_build_object(
        'sharing_permission_id', NEW.id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'medical_record_id', NEW.medical_record_id,
        'permission_type', NEW.permission_type,
        'status', NEW.status,
        'decision_date', NEW.updated_at,
        'request_type', 'in_hospital'
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix create_appointment_access_notification function
CREATE OR REPLACE FUNCTION public.create_appointment_access_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  patient_name TEXT;
  provider_name TEXT;
  appointment_info RECORD;
BEGIN
  -- Only create notification when access is granted (not when initially created)
  IF NEW.access_granted = true AND (OLD.access_granted IS NULL OR OLD.access_granted = false) THEN
    
    -- Get appointment information
    SELECT * INTO appointment_info
    FROM enhanced_appointments 
    WHERE id = NEW.appointment_id;
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name for context
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.provider_id;
    
    -- Insert notification for the provider
    INSERT INTO provider_notifications (
      provider_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.provider_id,
      'access_granted',
      '✅ Appointment Access Approved',
      format('Patient %s has approved your access request for their %s appointment on %s. You can now view their medical records.',
        COALESCE(patient_name, 'Unknown Patient'),
        COALESCE(appointment_info.appointment_type, 'scheduled'),
        TO_CHAR(appointment_info.appointment_date, 'Mon DD, YYYY at HH12:MI AM')
      ),
      CASE 
        WHEN appointment_info.urgency_level = 'urgent' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'appointment_id', NEW.appointment_id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'appointment_type', appointment_info.appointment_type,
        'appointment_date', appointment_info.appointment_date,
        'access_expires_at', NEW.access_expires_at,
        'request_type', 'appointment_access'
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;