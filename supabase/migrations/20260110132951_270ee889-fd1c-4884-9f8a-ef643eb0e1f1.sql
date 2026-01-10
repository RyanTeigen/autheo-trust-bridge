-- Create DID documents table for storing decentralized identities
CREATE TABLE public.did_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  did TEXT UNIQUE NOT NULL,
  did_document JSONB NOT NULL,
  controller TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create DID verifications table for nonce management
CREATE TABLE public.did_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  message TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_did_documents_user_id ON public.did_documents(user_id);
CREATE INDEX idx_did_documents_did ON public.did_documents(did);
CREATE INDEX idx_did_documents_wallet ON public.did_documents(wallet_address);
CREATE INDEX idx_did_verifications_wallet ON public.did_verifications(wallet_address);
CREATE INDEX idx_did_verifications_nonce ON public.did_verifications(nonce);

-- Enable RLS
ALTER TABLE public.did_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.did_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for did_documents
CREATE POLICY "Users can view their own DID documents" 
ON public.did_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DID documents" 
ON public.did_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DID documents" 
ON public.did_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow public read of DID documents for verification (DIDs are meant to be public)
CREATE POLICY "Public can view active DID documents by DID" 
ON public.did_documents 
FOR SELECT 
USING (is_active = true);

-- RLS policies for did_verifications (service role handles most operations)
CREATE POLICY "Public can insert verification requests" 
ON public.did_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can read unexpired verifications" 
ON public.did_verifications 
FOR SELECT 
USING (expires_at > NOW() AND used = false);

-- Trigger for updating updated_at
CREATE TRIGGER update_did_documents_updated_at
BEFORE UPDATE ON public.did_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();