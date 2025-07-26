-- Fix enum usage by using existing values and updating the log function
-- First, let's update the log function to use existing enum values

CREATE OR REPLACE FUNCTION public.log_security_event_secure(
    event_type text,
    severity text,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    mapped_event_type text;
BEGIN
    -- Map event types to existing enum values
    mapped_event_type := CASE 
        WHEN event_type = 'SECURITY_INIT' THEN 'DATA_ACCESS'
        WHEN event_type = 'SESSION_CLEANUP' THEN 'LOGOUT'
        WHEN event_type = 'BREACH_DETECTED' THEN 'DATA_ACCESS'
        ELSE event_type
    END;
    
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
        mapped_event_type::audit_event_type,
        severity::audit_severity,
        format('%s: %s', event_type, description),
        metadata,
        CASE WHEN event_type IN ('PHI_ACCESS', 'MEDICAL_RECORD_ACCESS') THEN true ELSE false END,
        'security_event',
        NOW(),
        NOW() + INTERVAL '7 years'
    );
END;
$$;

-- Now reinitialize security settings
CREATE OR REPLACE FUNCTION public.initialize_security_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update security configurations with proper settings
  UPDATE security_configurations 
  SET config_value = '"480"'::jsonb, updated_at = NOW()
  WHERE config_key = 'session_timeout_minutes';
  
  UPDATE security_configurations 
  SET config_value = '"5"'::jsonb, updated_at = NOW()
  WHERE config_key = 'max_failed_login_attempts';
  
  UPDATE security_configurations 
  SET config_value = '"12"'::jsonb, updated_at = NOW()
  WHERE config_key = 'password_min_length';
  
  -- Log security initialization
  PERFORM log_security_event_secure(
    'SECURITY_INIT',
    'info',
    'Security settings initialized and configured',
    jsonb_build_object('timestamp', NOW(), 'action', 'configuration_update')
  );
END;
$function$;

-- Run the initialization
SELECT public.initialize_security_settings();

-- Create enhanced session management functions
CREATE OR REPLACE FUNCTION public.create_secure_session(
    user_id_param uuid,
    ip_address_param inet DEFAULT NULL,
    user_agent_param text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    session_token text;
    session_timeout_minutes integer;
BEGIN
    -- Get session timeout from configuration
    SELECT (config_value->>0)::integer 
    INTO session_timeout_minutes 
    FROM security_configurations 
    WHERE config_key = 'session_timeout_minutes' AND is_active = true;
    
    -- Default to 480 minutes if not configured
    session_timeout_minutes := COALESCE(session_timeout_minutes, 480);
    
    -- Generate secure session token
    session_token := encode(gen_random_bytes(32), 'base64');
    
    -- Insert new session
    INSERT INTO enhanced_user_sessions (
        user_id,
        session_token,
        expires_at,
        ip_address,
        user_agent,
        security_flags
    ) VALUES (
        user_id_param,
        session_token,
        NOW() + (session_timeout_minutes || ' minutes')::interval,
        ip_address_param,
        user_agent_param,
        jsonb_build_object(
            'created_method', 'secure_function',
            'security_level', 'enhanced'
        )
    );
    
    -- Log session creation
    PERFORM log_security_event_secure(
        'LOGIN',
        'info',
        'Secure session created',
        jsonb_build_object(
            'session_token_hash', encode(digest(session_token, 'sha256'), 'hex'),
            'ip_address', ip_address_param,
            'user_agent', user_agent_param
        )
    );
    
    RETURN session_token;
END;
$$;

-- Create security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    suspicious_activities integer;
    expired_sessions integer;
BEGIN
    -- Count suspicious activities in the last hour
    SELECT COUNT(*) INTO suspicious_activities
    FROM enhanced_audit_logs
    WHERE created_at > NOW() - INTERVAL '1 hour'
    AND severity IN ('high', 'critical');
    
    -- Clean up expired sessions
    UPDATE enhanced_user_sessions 
    SET is_active = false, 
        terminated_at = NOW(),
        termination_reason = 'expired'
    WHERE expires_at < NOW() AND is_active = true;
    
    GET DIAGNOSTICS expired_sessions = ROW_COUNT;
    
    -- Log monitoring results if there's activity
    IF suspicious_activities > 0 OR expired_sessions > 0 THEN
        PERFORM log_security_event_secure(
            'SESSION_CLEANUP',
            'info',
            'Security monitoring completed',
            jsonb_build_object(
                'suspicious_activities', suspicious_activities,
                'expired_sessions', expired_sessions,
                'monitoring_timestamp', NOW()
            )
        );
    END IF;
END;
$$;