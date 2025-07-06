-- Create webhook_events table for audit trail
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'anchoring_complete', 'anchoring_failed', etc.
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  webhook_url TEXT,
  response_status INTEGER,
  response_body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX idx_webhook_events_record_id ON webhook_events(record_id);
CREATE INDEX idx_webhook_events_sent_at ON webhook_events(sent_at DESC);
CREATE INDEX idx_webhook_events_success ON webhook_events(success);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage webhook events
CREATE POLICY "Service role can manage webhook events"
ON webhook_events
FOR ALL
USING (auth.role() = 'service_role');

-- Policy to allow users to view webhook events for their records
CREATE POLICY "Users can view webhook events for their records"
ON webhook_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM medical_records 
    WHERE id = webhook_events.record_id 
    AND user_id = auth.uid()
  )
);