-- Simple security fixes without complex enum handling
-- Drop the problematic function and create a simpler version

DROP FUNCTION IF EXISTS public.log_security_event_secure(text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.initialize_security_settings();

-- Create a simpler audit logging function that doesn't require custom event types
CREATE OR REPLACE FUNCTION public.log_security_event_simple(
    action_description text,
    severity text,
    metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        'system_access'::audit_event_type,
        severity::audit_severity,
        action_description,
        metadata,
        false,
        'security_event',
        NOW(),
        NOW() + INTERVAL '7 years'
    );
END;
$$;

-- Initialize security configurations directly
UPDATE security_configurations 
SET config_value = '"480"'::jsonb, updated_at = NOW()
WHERE config_key = 'session_timeout_minutes';

UPDATE security_configurations 
SET config_value = '"5"'::jsonb, updated_at = NOW()
WHERE config_key = 'max_failed_login_attempts';

UPDATE security_configurations 
SET config_value = '"12"'::jsonb, updated_at = NOW()
WHERE config_key = 'password_min_length';

-- Log the security initialization
SELECT log_security_event_simple(
    'Security configurations initialized - session timeout: 480min, max login attempts: 5, min password length: 12',
    'info',
    jsonb_build_object('timestamp', NOW(), 'component', 'security_configuration')
);

-- Create enhanced session validation function
CREATE OR REPLACE FUNCTION public.validate_session_secure(session_token_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_record enhanced_user_sessions%ROWTYPE;
    result jsonb;
BEGIN
    -- Find the session
    SELECT * INTO session_record
    FROM enhanced_user_sessions
    WHERE session_token = session_token_param
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'session_not_found'
        );
    END IF;
    
    -- Check if session has expired
    IF session_record.expires_at <= NOW() THEN
        -- Mark session as expired
        UPDATE enhanced_user_sessions
        SET is_active = false,
            terminated_at = NOW(),
            termination_reason = 'expired'
        WHERE id = session_record.id;
        
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'session_expired'
        );
    END IF;
    
    -- Update last activity
    UPDATE enhanced_user_sessions
    SET last_activity = NOW()
    WHERE id = session_record.id;
    
    -- Return valid session info
    RETURN jsonb_build_object(
        'valid', true,
        'user_id', session_record.user_id,
        'expires_at', session_record.expires_at,
        'last_activity', NOW()
    );
END;
$$;

-- Create breach detection function without complex logging
CREATE OR REPLACE FUNCTION public.detect_security_breach_simple(
    user_id_param uuid,
    detection_type text,
    risk_score integer DEFAULT 50
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    breach_id uuid;
    severity_level text;
BEGIN
    -- Determine severity based on risk score
    severity_level := CASE 
        WHEN risk_score >= 80 THEN 'critical'
        WHEN risk_score >= 60 THEN 'high'
        WHEN risk_score >= 40 THEN 'medium'
        ELSE 'low'
    END;
    
    -- Insert breach detection record
    INSERT INTO enhanced_breach_detection (
        user_id,
        detection_type,
        severity_level,
        risk_score,
        threat_indicators
    ) VALUES (
        user_id_param,
        detection_type,
        severity_level,
        risk_score,
        jsonb_build_object(
            'risk_score', risk_score,
            'detection_method', 'automated',
            'timestamp', NOW()
        )
    )
    RETURNING id INTO breach_id;
    
    -- Log the breach detection
    PERFORM log_security_event_simple(
        format('Security breach detected: %s (Risk Score: %s)', detection_type, risk_score),
        CASE WHEN risk_score >= 60 THEN 'critical' ELSE 'warn' END,
        jsonb_build_object('breach_id', breach_id, 'detection_type', detection_type, 'risk_score', risk_score)
    );
    
    RETURN breach_id;
END;
$$;