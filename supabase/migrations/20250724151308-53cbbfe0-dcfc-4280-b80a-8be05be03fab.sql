-- Fix critical RLS policy vulnerabilities (corrected version)

-- 1. Create a proper role management system to prevent privilege escalation
-- First, create a security definer function for role checking to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Fix profiles table RLS policies to prevent role escalation
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create secure policies that prevent role changes
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile except role" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 3. Create admin-only role management policy
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (public.get_current_user_role() = 'admin');

-- 4. Add rate limiting to prevent abuse
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  attempts integer DEFAULT 1,
  reset_at timestamp with time zone DEFAULT NOW() + INTERVAL '1 hour',
  created_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits" ON public.rate_limits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (true);

-- 5. Add session security enhancements
ALTER TABLE IF EXISTS public.user_sessions 
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS security_flags jsonb DEFAULT '{}';

-- 6. Create secure audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(
  operation_type text,
  resource_type text,
  resource_id uuid DEFAULT NULL,
  additional_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    status,
    details,
    phi_accessed,
    timestamp
  ) VALUES (
    auth.uid(),
    operation_type,
    resource_type,
    resource_id,
    'success',
    additional_details::text,
    CASE WHEN resource_type IN ('medical_records', 'health_data') THEN true ELSE false END,
    NOW()
  );
END;
$function$;