
-- Create revoked_shares table for tracking revoked access
CREATE TABLE public.revoked_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  revoked_by UUID NOT NULL REFERENCES profiles(id),
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS on revoked_shares table
ALTER TABLE public.revoked_shares ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own revocations
CREATE POLICY "Users can view their own revocations" 
  ON public.revoked_shares 
  FOR SELECT 
  USING (auth.uid() = revoked_by);

-- Create policy for users to insert their own revocations
CREATE POLICY "Users can create their own revocations" 
  ON public.revoked_shares 
  FOR INSERT 
  WITH CHECK (auth.uid() = revoked_by);

-- Add index for performance
CREATE INDEX idx_revoked_shares_record_id ON public.revoked_shares(record_id);
CREATE INDEX idx_revoked_shares_revoked_by ON public.revoked_shares(revoked_by);
