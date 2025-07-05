-- Create anchored_logs table to track audit log exports and blockchain anchoring
CREATE TABLE public.anchored_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL,
  hash TEXT NOT NULL,
  anchored BOOLEAN DEFAULT FALSE,
  anchor_tx_hash TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  initiated_by UUID REFERENCES profiles(id)
);

-- Enable RLS on anchored_logs table
ALTER TABLE public.anchored_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Compliance officers and admins can view all anchored logs
CREATE POLICY "Compliance officers can view all anchored logs" 
ON public.anchored_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['compliance'::user_role, 'admin'::user_role])
));

-- Policy: Authenticated users can insert their own anchored logs
CREATE POLICY "Users can insert their own anchored logs" 
ON public.anchored_logs 
FOR INSERT 
WITH CHECK (auth.uid() = initiated_by);

-- Policy: Compliance officers can update anchored logs (for blockchain anchoring)
CREATE POLICY "Compliance officers can update anchored logs" 
ON public.anchored_logs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['compliance'::user_role, 'admin'::user_role])
));