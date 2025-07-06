-- Create hash_anchor_queue table for tracking blockchain anchoring
CREATE TABLE IF NOT EXISTS hash_anchor_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  anchor_status TEXT DEFAULT 'pending', -- 'pending' | 'anchored' | 'failed'
  blockchain_tx_hash TEXT,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  anchored_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Create indexes for better query performance  
CREATE INDEX idx_hash_anchor_queue_status ON hash_anchor_queue(anchor_status);
CREATE INDEX idx_hash_anchor_queue_record_id ON hash_anchor_queue(record_id);
CREATE INDEX idx_hash_anchor_queue_queued_at ON hash_anchor_queue(queued_at DESC);

-- Enable Row Level Security
ALTER TABLE hash_anchor_queue ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view anchoring status for their records
CREATE POLICY "Users can view anchor status for their records"
ON hash_anchor_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM medical_records 
    WHERE id = hash_anchor_queue.record_id 
    AND user_id = auth.uid()
  )
);

-- Policy to allow service role to manage anchoring queue
CREATE POLICY "Service role can manage anchor queue"
ON hash_anchor_queue
FOR ALL
USING (auth.role() = 'service_role');

-- Policy to allow authenticated users to insert into queue
CREATE POLICY "Authenticated users can insert anchor queue"
ON hash_anchor_queue
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');