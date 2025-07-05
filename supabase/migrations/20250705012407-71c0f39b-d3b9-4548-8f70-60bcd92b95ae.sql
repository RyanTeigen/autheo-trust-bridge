-- Fix the test data to have proper patient-provider relationships

-- First, let's update one of the provider users to be a patient for testing
UPDATE profiles 
SET role = 'patient'
WHERE id = 'cfc9f9d5-0548-413a-bdb6-e691f3c33613';

-- Create a proper patient record for the patient user
INSERT INTO patients (id, user_id, full_name, email)
SELECT 
  gen_random_uuid(),
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613',
  'Ryan Teigen',
  'ryan.teigen921@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM patients WHERE user_id = 'cfc9f9d5-0548-413a-bdb6-e691f3c33613'
);

-- Now create a proper sharing permission where the provider (Robert) requests access to patient's (Ryan) records
-- First, let's create a medical record for the patient
INSERT INTO medical_records (id, user_id, record_type, encrypted_data, created_at)
SELECT 
  'e12a5b7a-3b9c-4fe8-b4dc-75bef732291f',
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613',
  'Test Medical Record',
  'encrypted_test_data',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM medical_records WHERE id = 'e12a5b7a-3b9c-4fe8-b4dc-75bef732291f'
);

-- Update the sharing permission to have correct structure:
-- patient_id = patient who owns the data (Ryan - now patient)
-- grantee_id = provider requesting access (Robert - provider)  
UPDATE sharing_permissions 
SET 
  patient_id = (SELECT id FROM patients WHERE user_id = 'cfc9f9d5-0548-413a-bdb6-e691f3c33613'),
  grantee_id = 'e318695b-004f-47df-8562-2bee962e66d6'  -- Robert (provider)
WHERE id = 'f20096c6-1241-4620-9662-aaa4f73bc644';