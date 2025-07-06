-- Create audit_logs table for comprehensive action tracking
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hash TEXT,
  anchored BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert audit logs
CREATE POLICY "Allow authenticated users to log actions"
ON audit_logs
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON audit_logs
FOR SELECT
USING (actor_id = auth.uid());

-- Policy to allow compliance and admin users to view all audit logs
CREATE POLICY "Compliance and admin can view all audit logs"
ON audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);