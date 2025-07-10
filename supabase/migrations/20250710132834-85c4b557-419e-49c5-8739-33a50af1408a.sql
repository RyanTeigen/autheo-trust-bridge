-- Add patient_id and provider_id columns to hash_anchor_queue table
ALTER TABLE hash_anchor_queue 
ADD COLUMN patient_id UUID,
ADD COLUMN provider_id UUID;

-- Create indexes for better performance
CREATE INDEX idx_hash_anchor_queue_patient_id ON hash_anchor_queue(patient_id);
CREATE INDEX idx_hash_anchor_queue_provider_id ON hash_anchor_queue(provider_id);

-- Update RLS policies to include patient and provider access
DROP POLICY IF EXISTS "Users can view anchor status for their records" ON hash_anchor_queue;
DROP POLICY IF EXISTS "Authenticated users can insert anchor queue" ON hash_anchor_queue;

-- Updated policy for viewing anchor status
CREATE POLICY "Users can view anchor status for their records"
ON hash_anchor_queue
FOR SELECT
USING (
  -- Users can see their own records
  EXISTS (
    SELECT 1 FROM medical_records 
    WHERE id = hash_anchor_queue.record_id 
    AND user_id = auth.uid()
  )
  OR
  -- Patients can see their records
  patient_id = auth.uid()
  OR
  -- Providers can see records they created
  provider_id = auth.uid()
);

-- Updated policy for inserting anchor queue
CREATE POLICY "Authenticated users can insert anchor queue"
ON hash_anchor_queue
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND (
    -- Must be the provider creating the record
    provider_id = auth.uid() 
    OR 
    -- Or have permission to create records for this patient
    EXISTS (
      SELECT 1 FROM medical_records mr
      WHERE mr.id = record_id 
      AND (mr.provider_id = auth.uid() OR mr.user_id = auth.uid())
    )
  )
);