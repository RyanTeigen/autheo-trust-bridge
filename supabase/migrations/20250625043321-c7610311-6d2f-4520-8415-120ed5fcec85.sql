
-- Create the audit_hash_anchors table for storing blockchain anchor records
CREATE TABLE public.audit_hash_anchors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hash TEXT NOT NULL,
  log_count INTEGER NOT NULL,
  blockchain_tx_hash TEXT,
  blockchain_network TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.audit_hash_anchors ENABLE ROW LEVEL SECURITY;

-- Create policy for compliance officers and admins to view all hash anchors
CREATE POLICY "Compliance officers can view all hash anchors" 
ON public.audit_hash_anchors 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- Create policy for authenticated users to insert hash anchors
CREATE POLICY "Authenticated users can insert hash anchors" 
ON public.audit_hash_anchors 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX idx_audit_hash_anchors_created_at ON public.audit_hash_anchors(created_at DESC);
CREATE INDEX idx_audit_hash_anchors_hash ON public.audit_hash_anchors(hash);
