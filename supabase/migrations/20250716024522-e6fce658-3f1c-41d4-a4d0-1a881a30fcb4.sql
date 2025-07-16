-- Add only the missing revocation tracking columns to sharing_permissions table
ALTER TABLE public.sharing_permissions 
ADD COLUMN IF NOT EXISTS revoked_reason text,
ADD COLUMN IF NOT EXISTS revoked_at timestamptz;