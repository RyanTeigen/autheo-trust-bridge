
-- Create the audit_anchors table for storing blockchain anchor records
CREATE TABLE public.audit_anchors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT NOT NULL,
  anchored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  audit_hash TEXT,
  log_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.audit_anchors ENABLE ROW LEVEL SECURITY;

-- Create policy for compliance officers and admins to view all anchors
CREATE POLICY "Compliance officers can view all anchors" 
ON public.audit_anchors 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- Create policy for authenticated users to insert anchors (for automated processes)
CREATE POLICY "Authenticated users can insert anchors" 
ON public.audit_anchors 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX idx_audit_anchors_tx_hash ON public.audit_anchors(tx_hash);
CREATE INDEX idx_audit_anchors_anchored_at ON public.audit_anchors(anchored_at DESC);
