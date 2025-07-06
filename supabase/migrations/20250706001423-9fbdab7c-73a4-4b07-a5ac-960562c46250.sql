-- Add encryption_scheme column to medical_records table
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS encryption_scheme TEXT DEFAULT 'AES-256-GCM + ML-KEM-768';

-- Add comments to mark old fields as deprecated
COMMENT ON COLUMN medical_records.encrypted_data IS 'Legacy field: being replaced by encrypted_payload + encrypted_key';

-- Update RLS policies for encrypted records
DROP POLICY IF EXISTS "Providers can insert encrypted records" ON medical_records;
DROP POLICY IF EXISTS "Patients and approved recipients can read encrypted records" ON medical_records;

-- Policy for providers to insert encrypted records
CREATE POLICY "Providers can insert encrypted records"
ON medical_records
FOR INSERT
WITH CHECK (
  auth.uid() = provider_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'provider'
  )
);

-- Policy for patients and approved recipients to read encrypted records
CREATE POLICY "Patients and approved recipients can read encrypted records"
ON medical_records
FOR SELECT
USING (
  -- Patient can read their own records via user_id
  auth.uid() = user_id OR
  -- Patient can read records where they are the patient via patients table
  (patient_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM patients 
    WHERE id = medical_records.patient_id AND user_id = auth.uid()
  )) OR
  -- Approved recipients can read shared records
  EXISTS (
    SELECT 1 FROM sharing_permissions sp
    WHERE sp.medical_record_id = medical_records.id 
    AND sp.grantee_id = auth.uid() 
    AND sp.status = 'approved'
    AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
  )
);