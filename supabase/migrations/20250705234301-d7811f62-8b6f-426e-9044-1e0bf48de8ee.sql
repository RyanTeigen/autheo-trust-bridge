-- Create record_anchors table for blockchain anchoring
CREATE TABLE public.record_anchors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL,
  anchor_hash TEXT NOT NULL,
  anchored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blockchain_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.record_anchors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view anchors for their records" 
ON public.record_anchors 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM medical_records 
  WHERE medical_records.id = record_anchors.record_id 
  AND medical_records.user_id = auth.uid()
));

CREATE POLICY "Service role can insert anchors" 
ON public.record_anchors 
FOR INSERT 
WITH CHECK (true);