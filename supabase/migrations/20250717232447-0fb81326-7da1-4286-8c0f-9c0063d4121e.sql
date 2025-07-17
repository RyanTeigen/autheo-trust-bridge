-- Create trigger function to automatically create notifications for new access requests
CREATE OR REPLACE FUNCTION create_access_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the patient
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
    'access_request',
    '🏥 New Access Request',
    'A healthcare provider is requesting access to your medical records. Please review and respond.',
    CASE 
      WHEN NEW.urgency_level = 'critical' THEN 'urgent'
      WHEN NEW.urgency_level = 'high' THEN 'high'
      ELSE 'normal'
    END,
    jsonb_build_object(
      'request_id', NEW.id,
      'grantee_id', NEW.grantee_id,
      'medical_record_id', NEW.medical_record_id,
      'permission_type', NEW.permission_type,
      'urgency_level', NEW.urgency_level,
      'clinical_justification', NEW.clinical_justification
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create notifications when access requests are inserted
CREATE TRIGGER create_access_request_notification_trigger
  AFTER INSERT ON sharing_permissions
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_access_request_notification();

-- Enable realtime for patient_notifications table
ALTER TABLE patient_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_notifications;