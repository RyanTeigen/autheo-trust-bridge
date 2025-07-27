-- Fix the create_appointment_access_notification function with proper search path
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
    FROM public.enhanced_appointments 
    WHERE id = NEW.appointment_id;
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM public.patients p
    LEFT JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name for context
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
    INTO provider_name
    FROM public.profiles
    WHERE id = NEW.provider_id;
    
    -- Insert notification for the provider
    INSERT INTO public.provider_notifications (
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