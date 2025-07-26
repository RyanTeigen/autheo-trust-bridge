-- Fix security definer views by removing SECURITY DEFINER and ensuring proper RLS
-- This addresses the critical security vulnerabilities

-- Drop and recreate problematic views without SECURITY DEFINER
DROP VIEW IF EXISTS public.patient_accessible_records;
DROP VIEW IF EXISTS public.provider_accessible_records;

-- Fix function search paths for security
ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.get_current_user_role_secure() SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';

-- Create secure function to check provider access with proper search path
CREATE OR REPLACE FUNCTION public.check_provider_access(
  _provider_id uuid,
  _patient_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  -- Check if provider has active permission to access patient data
  RETURN EXISTS (
    SELECT 1 
    FROM public.sharing_permissions sp
    WHERE sp.grantee_id = _provider_id
      AND sp.patient_id = _patient_id
      AND sp.status = 'approved'
      AND (sp.expires_at IS NULL OR sp.expires_at > now())
  );
END;
$$;

-- Create secure function to check patient ownership with proper search path
CREATE OR REPLACE FUNCTION public.check_patient_ownership(
  _user_id uuid,
  _patient_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.patients p
    WHERE p.id = _patient_id
      AND p.user_id = _user_id
  );
END;
$$;

-- Fix overly permissive RLS policies on medical_records
DROP POLICY IF EXISTS "Users can view their own records" ON public.medical_records;
DROP POLICY IF EXISTS "Providers can view shared records" ON public.medical_records;

-- Create more restrictive policies for medical_records
CREATE POLICY "Patients can view own medical records"
  ON public.medical_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = medical_records.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view explicitly shared records"
  ON public.medical_records
  FOR SELECT
  TO authenticated
  USING (
    public.check_provider_access(auth.uid(), medical_records.patient_id)
  );

CREATE POLICY "Users can insert own medical records"
  ON public.medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = medical_records.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- Fix sharing_permissions policies to be more restrictive
DROP POLICY IF EXISTS "Users can view sharing permissions" ON public.sharing_permissions;

CREATE POLICY "Patients can view their own sharing permissions"
  ON public.sharing_permissions
  FOR SELECT
  TO authenticated
  USING (
    public.check_patient_ownership(auth.uid(), patient_id)
  );

CREATE POLICY "Providers can view permissions granted to them"
  ON public.sharing_permissions
  FOR SELECT
  TO authenticated
  USING (grantee_id = auth.uid());

-- Fix security_configurations table - remove overly permissive policies
DROP POLICY IF EXISTS "Users can manage security configurations" ON public.security_configurations;

CREATE POLICY "Only admins can manage security configurations"
  ON public.security_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Ensure audit_logs has proper retention triggers
CREATE OR REPLACE FUNCTION public.enforce_audit_retention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Set retention period based on data sensitivity
  IF NEW.phi_accessed = true THEN
    NEW.retention_period = '7 years'::interval;
  ELSE
    NEW.retention_period = '3 years'::interval;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_retention_trigger ON public.audit_logs;
CREATE TRIGGER audit_retention_trigger
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_audit_retention();

-- Add constraint to prevent backdated audit logs
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_timestamp_check 
CHECK (timestamp >= (now() - interval '1 hour'));

-- Ensure critical tables have proper constraints
ALTER TABLE public.sharing_permissions
ADD CONSTRAINT valid_expiry_date 
CHECK (expires_at IS NULL OR expires_at > created_at);

-- Add rate limiting table for security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own rate limits"
  ON public.rate_limits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_provider_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_patient_ownership(uuid, uuid) TO authenticated;