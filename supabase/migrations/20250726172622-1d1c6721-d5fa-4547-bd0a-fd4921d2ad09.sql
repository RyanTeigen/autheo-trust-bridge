-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Compliance can view all security events" ON public.security_events;
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "System can manage rate limiting" ON public.rate_limiting;
DROP POLICY IF EXISTS "Users can view their own session security" ON public.session_security;
DROP POLICY IF EXISTS "System can manage session security" ON public.session_security;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_security ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Compliance can view all security events" ON public.security_events
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('admin', 'compliance', 'security')
));

CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "System can manage rate limiting" ON public.rate_limiting
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own session security" ON public.session_security
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can manage session security" ON public.session_security
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create password policy enforcement function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check minimum length (8 characters)
    IF length(password) < 8 THEN
        RETURN false;
    END IF;
    
    -- Check for at least one uppercase letter
    IF password !~ '[A-Z]' THEN
        RETURN false;
    END IF;
    
    -- Check for at least one lowercase letter
    IF password !~ '[a-z]' THEN
        RETURN false;
    END IF;
    
    -- Check for at least one digit
    IF password !~ '[0-9]' THEN
        RETURN false;
    END IF;
    
    -- Check for at least one special character
    IF password !~ '[^A-Za-z0-9]' THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$function$;

-- Create session validation function
CREATE OR REPLACE FUNCTION public.validate_session_security(
    session_id text,
    user_agent text DEFAULT NULL,
    ip_address inet DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    session_record session_security%ROWTYPE;
    risk_score integer := 0;
    security_flags jsonb := '{}';
BEGIN
    -- Get existing session record
    SELECT * INTO session_record
    FROM session_security
    WHERE session_security.session_id = validate_session_security.session_id
    AND user_id = auth.uid();
    
    -- Calculate risk score based on various factors
    IF ip_address IS NOT NULL THEN
        -- Check for IP changes (simplified - real implementation would be more sophisticated)
        IF session_record.id IS NOT NULL AND 
           (session_record.security_flags->>'last_ip') IS NOT NULL AND
           (session_record.security_flags->>'last_ip') != ip_address::text THEN
            risk_score := risk_score + 20;
            security_flags := security_flags || '{"ip_changed": true}';
        END IF;
    END IF;
    
    -- Check for user agent changes
    IF user_agent IS NOT NULL AND session_record.id IS NOT NULL THEN
        IF (session_record.security_flags->>'user_agent') IS NOT NULL AND
           (session_record.security_flags->>'user_agent') != user_agent THEN
            risk_score := risk_score + 15;
            security_flags := security_flags || '{"user_agent_changed": true}';
        END IF;
    END IF;
    
    -- Update or insert session security record
    INSERT INTO session_security (
        session_id,
        user_id,
        risk_score,
        security_flags,
        suspicious_activity
    ) VALUES (
        validate_session_security.session_id,
        auth.uid(),
        risk_score,
        security_flags || jsonb_build_object(
            'last_ip', COALESCE(ip_address::text, 'unknown'),
            'user_agent', COALESCE(user_agent, 'unknown'),
            'last_check', now()
        ),
        risk_score > 30
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        security_flags = EXCLUDED.security_flags,
        suspicious_activity = EXCLUDED.suspicious_activity,
        last_security_check = now(),
        updated_at = now();
    
    -- Log security event if suspicious
    IF risk_score > 30 THEN
        PERFORM log_security_event_enhanced(
            'SUSPICIOUS_SESSION',
            'medium',
            'Session flagged as suspicious due to risk factors',
            jsonb_build_object(
                'session_id', validate_session_security.session_id,
                'risk_score', risk_score,
                'flags', security_flags
            ),
            true
        );
    END IF;
    
    -- Return false if session is too risky
    RETURN risk_score < 50;
END;
$function$;

-- Create function to clean up old security events
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Delete security events older than 1 year
    DELETE FROM security_events 
    WHERE created_at < now() - INTERVAL '1 year'
    AND resolved = true;
    
    -- Delete rate limiting records older than 1 week
    DELETE FROM rate_limiting
    WHERE created_at < now() - INTERVAL '1 week';
    
    -- Delete old session security records
    DELETE FROM session_security
    WHERE created_at < now() - INTERVAL '1 month';
END;
$function$;