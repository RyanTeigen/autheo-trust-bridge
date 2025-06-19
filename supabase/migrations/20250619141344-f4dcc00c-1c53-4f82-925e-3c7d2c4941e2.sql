
-- Update the audit_logs table to use UUIDs and match your app structure
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Drop the old columns if they exist
ALTER TABLE public.audit_logs 
DROP COLUMN IF EXISTS user_id CASCADE;

-- Add the correct user_id column with UUID type
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update other columns to match your schema
ALTER TABLE public.audit_logs 
ALTER COLUMN resource_id TYPE UUID USING resource_id::UUID;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for inserting audit logs (service role can insert for any user)
CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);
