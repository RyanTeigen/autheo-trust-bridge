
-- Add encryption_public_key field to profiles table
ALTER TABLE public.profiles ADD COLUMN encryption_public_key TEXT;

-- Add iv field to medical_records table for encryption
ALTER TABLE public.medical_records ADD COLUMN iv TEXT;
