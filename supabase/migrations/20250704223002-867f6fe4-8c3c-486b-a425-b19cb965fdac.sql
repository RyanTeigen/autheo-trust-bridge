-- Create a test medical record from Robert (provider) and a sharing permission for Ryan (patient)
-- First, let's create a test medical record by Robert (provider)
INSERT INTO medical_records (
  id,
  provider_id,
  patient_id,
  record_type,
  encrypted_data,
  created_at
) VALUES (
  gen_random_uuid(),
  'e318695b-004f-47df-8562-2bee962e66d6', -- Robert (provider)
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613', -- Ryan (patient record ID)
  'Lab Results - Blood Work',
  '{"results": "Complete Blood Count results encrypted", "date": "2025-01-04", "provider": "Dr. Robert Meilbeck"}',
  now()
);

-- Now create a sharing permission request
INSERT INTO sharing_permissions (
  id,
  medical_record_id,
  patient_id,
  grantee_id,
  permission_type,
  status,
  created_at,
  expires_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM medical_records WHERE provider_id = 'e318695b-004f-47df-8562-2bee962e66d6' LIMIT 1),
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613', -- Ryan patient record ID
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613', -- Ryan user ID (grantee)
  'read',
  'pending',
  now(),
  now() + interval '30 days'
);