-- Fix function search paths for security
-- Update all functions that don't have secure search_path settings

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Fix get_current_user_role_secure function  
CREATE OR REPLACE FUNCTION public.get_current_user_role_secure()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = _user_id AND role::text = _role
    );
END;
$function$;

-- Fix check_user_permission_secure function
CREATE OR REPLACE FUNCTION public.check_user_permission_secure(required_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'compliance' OR role::text = required_permission)
    );
END;
$function$;

-- Fix log_security_event_secure function
CREATE OR REPLACE FUNCTION public.log_security_event_secure(event_type text, severity text, description text, metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO enhanced_audit_logs (
        user_id,
        event_type,
        severity,
        action_performed,
        details,
        phi_accessed,
        resource_type,
        created_at,
        retention_until
    ) VALUES (
        auth.uid(),
        event_type::audit_event_type,
        severity::audit_severity,
        description,
        metadata,
        CASE WHEN event_type IN ('PHI_ACCESS', 'MEDICAL_RECORD_ACCESS') THEN true ELSE false END,
        'security_event',
        NOW(),
        NOW() + INTERVAL '7 years'
    );
END;
$function$;

-- Create missing user roles enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin', 'compliance', 'security', 'auditor');
    END IF;
END $$;

-- Ensure profiles table has proper role column
DO $$
BEGIN
    -- Check if role column exists and update it if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Update the role column to use the enum if it's not already
        ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;
    ELSE
        -- Add role column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'patient'::user_role;
    END IF;
END $$;

-- Create rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limiting (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    action text NOT NULL,
    ip_address inet,
    attempts integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    blocked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limiting table
CREATE POLICY "System can manage rate limiting" ON public.rate_limiting
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create session security table for enhanced session tracking
CREATE TABLE IF NOT EXISTS public.session_security (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    user_id uuid NOT NULL,
    risk_score integer DEFAULT 0,
    security_flags jsonb DEFAULT '{}',
    last_security_check timestamp with time zone DEFAULT now(),
    suspicious_activity boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on session security table
ALTER TABLE public.session_security ENABLE ROW LEVEL SECURITY;

-- Create policy for session security table
CREATE POLICY "Users can view their own session security" ON public.session_security
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can manage session security" ON public.session_security
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create function for enhanced rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
    action_name text,
    max_attempts integer DEFAULT 10,
    window_minutes integer DEFAULT 60,
    block_minutes integer DEFAULT 15
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_attempts integer := 0;
    is_blocked boolean := false;
    window_start_time timestamp with time zone;
    user_ip inet;
BEGIN
    -- Get user's IP from current request context (simplified)
    user_ip := NULL; -- In practice, this would come from the request
    
    -- Check if user is currently blocked
    SELECT blocked_until > now() INTO is_blocked
    FROM rate_limiting
    WHERE (user_id = auth.uid() OR ip_address = user_ip)
    AND action = action_name
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF is_blocked THEN
        RETURN false;
    END IF;
    
    -- Calculate window start time
    window_start_time := now() - (window_minutes || ' minutes')::interval;
    
    -- Count attempts in current window
    SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
    FROM rate_limiting
    WHERE (user_id = auth.uid() OR ip_address = user_ip)
    AND action = action_name
    AND window_start >= window_start_time;
    
    -- If over limit, block user
    IF current_attempts >= max_attempts THEN
        INSERT INTO rate_limiting (user_id, action, ip_address, attempts, blocked_until)
        VALUES (
            auth.uid(),
            action_name,
            user_ip,
            1,
            now() + (block_minutes || ' minutes')::interval
        );
        RETURN false;
    END IF;
    
    -- Record this attempt
    INSERT INTO rate_limiting (user_id, action, ip_address, attempts)
    VALUES (auth.uid(), action_name, user_ip, 1)
    ON CONFLICT (user_id, action) 
    DO UPDATE SET 
        attempts = rate_limiting.attempts + 1,
        updated_at = now();
    
    RETURN true;
END;
$function$;

-- Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
    event_type text,
    severity text,
    description text,
    metadata jsonb DEFAULT '{}',
    auto_alert boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Log the security event
    INSERT INTO enhanced_audit_logs (
        user_id,
        event_type,
        severity,
        action_performed,
        details,
        phi_accessed,
        resource_type,
        created_at,
        retention_until
    ) VALUES (
        auth.uid(),
        event_type::audit_event_type,
        severity::audit_severity,
        description,
        metadata,
        CASE WHEN event_type IN ('PHI_ACCESS', 'MEDICAL_RECORD_ACCESS') THEN true ELSE false END,
        'security_event',
        NOW(),
        NOW() + INTERVAL '7 years'
    );
    
    -- Create breach detection event for critical issues
    IF severity IN ('critical', 'high') OR auto_alert THEN
        INSERT INTO enhanced_breach_detection (
            user_id,
            detection_type,
            severity_level,
            threat_indicators,
            risk_score,
            mitigation_status
        ) VALUES (
            auth.uid(),
            event_type,
            severity,
            jsonb_build_array(metadata),
            CASE 
                WHEN severity = 'critical' THEN 90
                WHEN severity = 'high' THEN 70
                ELSE 40
            END,
            'open'
        );
    END IF;
END;
$function$;