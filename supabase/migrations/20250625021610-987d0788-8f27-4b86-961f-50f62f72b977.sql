
-- Create the record_shares table for secure medical record sharing
CREATE TABLE public.record_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pq_encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE (record_id, shared_with_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.record_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shares where they are the recipient
CREATE POLICY "Users can view records shared with them" 
  ON public.record_shares 
  FOR SELECT 
  USING (auth.uid() = shared_with_user_id);

-- Policy: Record owners can view their shares (need to join with medical_records to check ownership)
CREATE POLICY "Record owners can view their shares" 
  ON public.record_shares 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr 
      JOIN public.patients p ON mr.patient_id = p.id 
      WHERE mr.id = record_shares.record_id 
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Record owners can create shares for their records
CREATE POLICY "Record owners can create shares" 
  ON public.record_shares 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.medical_records mr 
      JOIN public.patients p ON mr.patient_id = p.id 
      WHERE mr.id = record_shares.record_id 
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Record owners can update shares for their records
CREATE POLICY "Record owners can update shares" 
  ON public.record_shares 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr 
      JOIN public.patients p ON mr.patient_id = p.id 
      WHERE mr.id = record_shares.record_id 
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Record owners can delete shares for their records
CREATE POLICY "Record owners can delete shares" 
  ON public.record_shares 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr 
      JOIN public.patients p ON mr.patient_id = p.id 
      WHERE mr.id = record_shares.record_id 
      AND p.user_id = auth.uid()
    )
  );

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_record_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_shares_updated_at_trigger
    BEFORE UPDATE ON public.record_shares
    FOR EACH ROW
    EXECUTE FUNCTION public.update_record_shares_updated_at();
