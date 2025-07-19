
-- Update sharing_permissions trigger to create provider notifications for all decision types
CREATE OR REPLACE FUNCTION public.create_sharing_permission_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for sharing_permissions table
DROP TRIGGER IF EXISTS on_sharing_permission_decision ON sharing_permissions;
CREATE TRIGGER on_sharing_permission_decision
  AFTER UPDATE ON sharing_permissions
  FOR EACH ROW
  EXECUTE FUNCTION create_sharing_permission_notification();
