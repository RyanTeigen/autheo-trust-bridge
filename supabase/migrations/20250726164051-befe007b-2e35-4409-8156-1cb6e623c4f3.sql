-- First, let's create the profiles table if it doesn't exist and set up proper structure
-- The profiles table already exists, so let's just ensure it has the right structure

-- Fix function search paths for security (these don't depend on the role column type)
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
        AND (role::text = 'admin' OR role::text = 'compliance' OR role::text = required_permission)
    );
END;
$function$;

-- Create enhanced security tables for monitoring and rate limiting
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    event_type text NOT NULL,
    severity text NOT NULL DEFAULT 'info',
    description text NOT NULL,
    metadata jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    resolved boolean DEFAULT false,
    resolved_at timestamp with time zone
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security events
CREATE POLICY "Compliance can view all security events" ON public.security_events
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('admin', 'compliance', 'security')
));

CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT TO authenticated
WITH CHECK (true);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limiting (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    action text NOT NULL,
    ip_address inet,
    attempts integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    blocked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, action, ip_address)
);

-- Enable RLS on rate limiting
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;

-- Create policies for rate limiting
CREATE POLICY "System can manage rate limiting" ON public.rate_limiting
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create session security monitoring table
CREATE TABLE IF NOT EXISTS public.session_security (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    user_id uuid NOT NULL,
    risk_score integer DEFAULT 0,
    security_flags jsonb DEFAULT '{}',
    suspicious_activity boolean DEFAULT false,
    last_security_check timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on session security
ALTER TABLE public.session_security ENABLE ROW LEVEL SECURITY;

-- Create policies for session security
CREATE POLICY "Users can view their own session security" ON public.session_security
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can manage session security" ON public.session_security
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Enhanced rate limiting function
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
BEGIN
    -- Check if user is currently blocked
    SELECT blocked_until > now() INTO is_blocked
    FROM rate_limiting
    WHERE user_id = auth.uid()
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
    WHERE user_id = auth.uid()
    AND action = action_name
    AND window_start >= window_start_time;
    
    -- If over limit, block user
    IF current_attempts >= max_attempts THEN
        INSERT INTO rate_limiting (user_id, action, attempts, blocked_until)
        VALUES (
            auth.uid(),
            action_name,
            1,
            now() + (block_minutes || ' minutes')::interval
        )
        ON CONFLICT (user_id, action, ip_address) 
        DO UPDATE SET 
            attempts = rate_limiting.attempts + 1,
            blocked_until = now() + (block_minutes || ' minutes')::interval,
            updated_at = now();
        RETURN false;
    END IF;
    
    -- Record this attempt
    INSERT INTO rate_limiting (user_id, action, attempts)
    VALUES (auth.uid(), action_name, 1)
    ON CONFLICT (user_id, action, ip_address) 
    DO UPDATE SET 
        attempts = rate_limiting.attempts + 1,
        updated_at = now();
    
    RETURN true;
END;
$function$;

-- Enhanced security event logging
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
    INSERT INTO security_events (
        user_id,
        event_type,
        severity,
        description,
        metadata,
        created_at
    ) VALUES (
        auth.uid(),
        event_type,
        severity,
        description,
        metadata,
        NOW()
    );
    
    -- Also log to enhanced audit logs if table exists
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
    EXCEPTION 
        WHEN others THEN
            -- Ignore if enhanced_audit_logs doesn't exist or has issues
            NULL;
    END;
    
    -- Create breach detection event for critical issues
    IF severity IN ('critical', 'high') OR auto_alert THEN
        BEGIN
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
        EXCEPTION 
            WHEN others THEN
                -- Ignore if enhanced_breach_detection doesn't exist or has issues
                NULL;
        END;
    END IF;
END;
$function$;