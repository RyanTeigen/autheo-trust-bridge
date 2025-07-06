-- Create record_hashes table for comprehensive record tracking
CREATE TABLE record_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  patient_id UUID,
  provider_id UUID,
  hash TEXT NOT NULL,
  operation TEXT NOT NULL, -- e.g., 'created', 'updated', 'shared'
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  signer_id UUID -- optional: who performed the operation
);

-- Create indexes for better query performance
CREATE INDEX idx_record_hashes_record_id ON record_hashes(record_id);
CREATE INDEX idx_record_hashes_patient_id ON record_hashes(patient_id);
CREATE INDEX idx_record_hashes_timestamp ON record_hashes(timestamp DESC);
CREATE INDEX idx_record_hashes_operation ON record_hashes(operation);

-- Enable Row Level Security
ALTER TABLE record_hashes ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert record hashes
CREATE POLICY "Allow authenticated users to log record hashes"
ON record_hashes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow users to view hashes for their own records
CREATE POLICY "Users can view hashes for their own records"
ON record_hashes
FOR SELECT
USING (
  signer_id = auth.uid() OR
  patient_id = auth.uid() OR
  provider_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM medical_records 
    WHERE id = record_hashes.record_id 
    AND user_id = auth.uid()
  )
);

-- Policy to allow compliance and admin users to view all record hashes
CREATE POLICY "Compliance and admin can view all record hashes"
ON record_hashes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);