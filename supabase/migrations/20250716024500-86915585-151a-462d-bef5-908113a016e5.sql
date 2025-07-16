-- Add revocation tracking columns to sharing_permissions table
ALTER TABLE public.sharing_permissions 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
ADD COLUMN revoked_reason text,
ADD COLUMN revoked_at timestamptz;