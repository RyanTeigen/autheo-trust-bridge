-- Update the check constraint on enhanced_appointments to include 'approved' status
ALTER TABLE enhanced_appointments 
DROP CONSTRAINT enhanced_appointments_access_request_status_check;

ALTER TABLE enhanced_appointments 
ADD CONSTRAINT enhanced_appointments_access_request_status_check 
CHECK (access_request_status = ANY (ARRAY[
  'pending'::text, 
  'auto_approved'::text, 
  'manually_approved'::text,
  'approved'::text,
  'denied'::text
]));