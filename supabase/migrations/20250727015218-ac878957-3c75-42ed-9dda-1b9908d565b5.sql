-- Test the appointment access notification by updating an existing mapping
UPDATE appointment_access_mappings 
SET access_granted = true, updated_at = NOW()
WHERE id = '9a23bc8c-069f-48c3-8409-d68e3a9c5884';