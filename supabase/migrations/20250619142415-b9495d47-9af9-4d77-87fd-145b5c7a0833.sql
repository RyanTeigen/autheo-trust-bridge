
-- Step 1: Ensure audit_logs table has proper RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Recreate policies with proper names and permissions
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own audit logs
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role to insert audit logs for any user (for system operations)
CREATE POLICY "Service role can insert all audit logs" 
ON public.audit_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Ensure the table structure is correct
ALTER TABLE public.audit_logs 
  ALTER COLUMN action SET NOT NULL,
  ALTER COLUMN resource SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'success';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON public.audit_logs(status);
