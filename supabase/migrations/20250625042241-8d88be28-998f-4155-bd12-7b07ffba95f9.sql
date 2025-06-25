
-- Update the existing audit_logs table to ensure it has all needed columns and constraints
-- Add missing columns if they don't exist
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS target_type TEXT,
ADD COLUMN IF NOT EXISTS target_id UUID,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update existing columns to ensure they match our needs
ALTER TABLE public.audit_logs 
ALTER COLUMN action SET NOT NULL,
ALTER COLUMN resource SET NOT NULL;

-- Add indexes for better performance on audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON public.audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_timestamp ON public.audit_logs(user_id, action, timestamp DESC);

-- Create RLS policies for audit logs access
DROP POLICY IF EXISTS "Compliance officers can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

-- Allow compliance officers and admins to view all audit logs
CREATE POLICY "Compliance officers can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- Allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert audit logs
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);
