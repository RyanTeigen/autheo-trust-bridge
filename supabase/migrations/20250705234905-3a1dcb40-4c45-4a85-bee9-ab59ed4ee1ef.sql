-- Add hybrid encryption columns to medical_records table
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS encrypted_payload TEXT,
ADD COLUMN IF NOT EXISTS encrypted_key TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_records_encrypted 
ON medical_records(encrypted_payload) 
WHERE encrypted_payload IS NOT NULL;