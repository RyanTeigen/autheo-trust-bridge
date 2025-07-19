-- Create table for tracking consent revocations
CREATE TABLE public.consent_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id UUID NOT NULL REFERENCES public.consents(id) ON DELETE CASCADE,
  revoked_by UUID NOT NULL,
  reason TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revocation_hash TEXT NOT NULL,
  blockchain_tx_hash TEXT,
  anchored BOOLEAN DEFAULT false,
  anchored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consent_revocations ENABLE ROW LEVEL SECURITY;

-- Create policies for consent revocations
CREATE POLICY "Users can view their own consent revocations"
ON public.consent_revocations
FOR SELECT
USING (revoked_by = auth.uid() OR consent_id IN (
  SELECT id FROM public.consents 
  WHERE user_did = CONCAT('did:autheo:', auth.uid()::text)
));

CREATE POLICY "Users can create consent revocations for their consents"
ON public.consent_revocations
FOR INSERT
WITH CHECK (revoked_by = auth.uid() AND consent_id IN (
  SELECT id FROM public.consents 
  WHERE user_did = CONCAT('did:autheo:', auth.uid()::text)
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_consent_revocations_updated_at
BEFORE UPDATE ON public.consent_revocations
FOR EACH ROW
EXECUTE FUNCTION public.update_medical_records_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_consent_revocations_consent_id ON public.consent_revocations(consent_id);
CREATE INDEX idx_consent_revocations_revoked_by ON public.consent_revocations(revoked_by);
CREATE INDEX idx_consent_revocations_revoked_at ON public.consent_revocations(revoked_at DESC);

-- Add metadata column to hash_anchor_queue if it doesn't exist
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.hash_anchor_queue ADD COLUMN metadata JSONB DEFAULT '{}';
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;