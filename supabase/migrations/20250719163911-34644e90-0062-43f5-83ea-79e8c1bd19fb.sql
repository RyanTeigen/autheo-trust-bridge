-- Create function to create notification when access request is approved
CREATE OR REPLACE FUNCTION public.create_access_approved_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status changed to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Insert notification for the grantee (provider)
    INSERT INTO patient_notifications (
      patient_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.grantee_id,
      'access_granted',
      '✅ Access Request Approved',
      'Your access request for patient records has been approved. You can now view the shared medical records.',
      'normal',
      jsonb_build_object(
        'permission_id', NEW.id,
        'patient_id', NEW.patient_id,
        'medical_record_id', NEW.medical_record_id,
        'permission_type', NEW.permission_type,
        'granted_at', NEW.updated_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sharing_permissions table
DROP TRIGGER IF EXISTS on_access_approved ON sharing_permissions;
CREATE TRIGGER on_access_approved
  AFTER UPDATE ON sharing_permissions
  FOR EACH ROW
  EXECUTE FUNCTION create_access_approved_notification();