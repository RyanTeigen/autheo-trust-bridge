-- Ensure sharing_permissions table has the necessary revocation columns
ALTER TABLE public.sharing_permissions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
ADD COLUMN IF NOT EXISTS revoked_reason text;