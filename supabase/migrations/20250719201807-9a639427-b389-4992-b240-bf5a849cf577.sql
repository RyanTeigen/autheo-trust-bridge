-- Create function to automatically create notifications for cross-hospital requests
CREATE OR REPLACE FUNCTION public.create_cross_hospital_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  provider_name TEXT;
  requesting_hospital_name TEXT;
  receiving_hospital_name TEXT;
BEGIN
  -- Get patient name
  SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
  INTO patient_name
  FROM patients p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE p.id = NEW.patient_id;
  
  -- Get provider name
  SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
  INTO provider_name
  FROM profiles
  WHERE id = NEW.provider_id;
  
  -- Get requesting hospital name
  SELECT hospital_name INTO requesting_hospital_name
  FROM hospital_registry
  WHERE hospital_id = NEW.requesting_hospital_id;
  
  -- Get receiving hospital name  
  SELECT hospital_name INTO receiving_hospital_name
  FROM hospital_registry
  WHERE hospital_id = NEW.receiving_hospital_id;
  
  -- Insert notification for the patient
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
    'cross_hospital_request',
    '🏥 Cross-Hospital Access Request',
    format('Dr. %s from %s is requesting access to your medical records from %s for %s. Clinical justification: %s',
      COALESCE(provider_name, 'Unknown Provider'),
      COALESCE(requesting_hospital_name, 'Unknown Hospital'),
      COALESCE(receiving_hospital_name, 'Previous Hospital'),
      LOWER(NEW.request_type),
      COALESCE(NEW.clinical_justification, 'Medical care coordination')
    ),
    CASE 
      WHEN NEW.urgency_level = 'emergency' THEN 'urgent'
      WHEN NEW.urgency_level = 'urgent' THEN 'high'
      ELSE 'normal'
    END,
    jsonb_build_object(
      'request_id', NEW.id,
      'provider_id', NEW.provider_id,
      'provider_name', provider_name,
      'requesting_hospital_id', NEW.requesting_hospital_id,
      'requesting_hospital_name', requesting_hospital_name,
      'receiving_hospital_id', NEW.receiving_hospital_id,
      'receiving_hospital_name', receiving_hospital_name,
      'urgency_level', NEW.urgency_level,
      'clinical_justification', NEW.clinical_justification,
      'request_type', NEW.request_type
    ),
    NOW(),
    CASE 
      WHEN NEW.urgency_level = 'emergency' THEN NOW() + INTERVAL '24 hours'
      WHEN NEW.urgency_level = 'urgent' THEN NOW() + INTERVAL '72 hours'
      ELSE NOW() + INTERVAL '7 days'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cross_hospital_requests table
DROP TRIGGER IF EXISTS on_cross_hospital_request_created ON cross_hospital_requests;
CREATE TRIGGER on_cross_hospital_request_created
  AFTER INSERT ON cross_hospital_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_cross_hospital_request_notification();