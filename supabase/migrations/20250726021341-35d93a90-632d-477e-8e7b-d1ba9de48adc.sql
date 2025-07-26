-- Fix enum error and continue security improvements
-- First, let's check and create the required enum types

-- Create the audit event type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_type') THEN
        CREATE TYPE audit_event_type AS ENUM (
            'LOGIN',
            'LOGOUT', 
            'DATA_ACCESS',
            'PHI_ACCESS',
            'MEDICAL_RECORD_ACCESS',
            'PERMISSION_GRANTED',
            'PERMISSION_REVOKED',
            'SECURITY_INIT',
            'SESSION_CLEANUP',
            'BREACH_DETECTED',
            'AUDIT_EXPORT',
            'USER_CREATED',
            'USER_UPDATED',
            'ROLE_CHANGED',
            'PASSWORD_CHANGED',
            'MFA_ENABLED',
            'MFA_DISABLED'
        );
    ELSE
        -- Add missing values to existing enum
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'SECURITY_INIT';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'SESSION_CLEANUP';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'BREACH_DETECTED';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'AUDIT_EXPORT';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'USER_CREATED';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'USER_UPDATED';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'ROLE_CHANGED';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'PASSWORD_CHANGED';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'MFA_ENABLED';
        ALTER TYPE audit_event_type ADD VALUE IF NOT EXISTS 'MFA_DISABLED';
    END IF;
END
$$;

-- Create the audit severity enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_severity') THEN
        CREATE TYPE audit_severity AS ENUM ('low', 'info', 'warn', 'high', 'critical');
    END IF;
END
$$;

-- Now reinitialize security settings with proper enum values
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
  
  -- Log security initialization with proper enum value
  PERFORM log_security_event_secure(
    'SECURITY_INIT',
    'info',
    'Security settings initialized',
    jsonb_build_object('timestamp', NOW())
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
    SELECT (config_value->>'session_timeout_minutes')::integer 
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
    failed_logins integer;
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
    
    -- Log monitoring results
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
END;
$$;