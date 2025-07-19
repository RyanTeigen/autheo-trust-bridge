-- Create consents table for storing consent records
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT NOT NULL,
  requester TEXT NOT NULL,
  data_types TEXT[] NOT NULL,
  duration INTERVAL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tx_id TEXT,
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Create policies for consent access
CREATE POLICY "Users can view their own consents"
ON public.consents
FOR SELECT
USING (user_did = CONCAT('did:autheo:', auth.uid()::text) OR user_did IN (
  SELECT CONCAT('did:autheo:', profiles.id::text) 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can create their own consents"
ON public.consents
FOR INSERT
WITH CHECK (user_did = CONCAT('did:autheo:', auth.uid()::text) OR user_did IN (
  SELECT CONCAT('did:autheo:', profiles.id::text) 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can update their own consents"
ON public.consents
FOR UPDATE
USING (user_did = CONCAT('did:autheo:', auth.uid()::text) OR user_did IN (
  SELECT CONCAT('did:autheo:', profiles.id::text) 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_consents_updated_at
BEFORE UPDATE ON public.consents
FOR EACH ROW
EXECUTE FUNCTION public.update_medical_records_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_consents_user_did ON public.consents(user_did);
CREATE INDEX idx_consents_requester ON public.consents(requester);
CREATE INDEX idx_consents_timestamp ON public.consents(timestamp DESC);
CREATE INDEX idx_consents_revoked ON public.consents(revoked) WHERE revoked = false;