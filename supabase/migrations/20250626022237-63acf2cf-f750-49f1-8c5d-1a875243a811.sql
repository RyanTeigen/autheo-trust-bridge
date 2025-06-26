
-- Add record_hash and anchored_at columns to medical_records table
ALTER TABLE medical_records ADD COLUMN record_hash TEXT;
ALTER TABLE medical_records ADD COLUMN anchored_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on hash lookups
CREATE INDEX IF NOT EXISTS idx_medical_records_record_hash ON medical_records(record_hash);
CREATE INDEX IF NOT EXISTS idx_medical_records_anchored_at ON medical_records(anchored_at);

-- Create anchored_hashes table for tracking blockchain anchors
CREATE TABLE IF NOT EXISTS public.anchored_hashes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  record_hash TEXT NOT NULL,
  anchor_tx_url TEXT,
  anchored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for anchored_hashes
ALTER TABLE public.anchored_hashes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own anchored hashes
CREATE POLICY "Users can view their own anchored hashes" 
ON public.anchored_hashes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM medical_records 
    WHERE medical_records.id = anchored_hashes.record_id 
    AND medical_records.user_id = auth.uid()
  )
);

-- Create policy for service role to insert anchored hashes
CREATE POLICY "Service role can insert anchored hashes" 
ON public.anchored_hashes 
FOR INSERT 
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_anchored_hashes_record_id ON anchored_hashes(record_id);
CREATE INDEX IF NOT EXISTS idx_anchored_hashes_anchored_at ON anchored_hashes(anchored_at DESC);
