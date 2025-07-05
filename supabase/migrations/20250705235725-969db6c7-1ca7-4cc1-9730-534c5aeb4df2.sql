-- Add kyber_public_key column to patients table for storing encryption keys
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS kyber_public_key TEXT;