-- Update the check constraint on patient_notifications to include new notification types
ALTER TABLE patient_notifications 
DROP CONSTRAINT patient_notifications_type_check;

ALTER TABLE patient_notifications 
ADD CONSTRAINT patient_notifications_type_check 
CHECK (notification_type = ANY (ARRAY[
  'access_request'::text, 
  'access_granted'::text, 
  'access_revoked'::text, 
  'access_auto_approved'::text,
  'appointment_access_request'::text,
  'reminder'::text, 
  'urgent'::text
]));