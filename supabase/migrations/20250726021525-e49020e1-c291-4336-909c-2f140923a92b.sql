-- Fix the security function to use correct enum values
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
        WHEN event_type = 'SECURITY_INIT' THEN 'configuration_change'
        WHEN event_type = 'SESSION_CLEANUP' THEN 'logout'
        WHEN event_type = 'BREACH_DETECTED' THEN 'system_access'
        WHEN event_type = 'LOGIN' THEN 'login'
        WHEN event_type = 'LOGOUT' THEN 'logout'
        WHEN event_type = 'PHI_ACCESS' THEN 'phi_access'
        WHEN event_type = 'MEDICAL_RECORD_ACCESS' THEN 'phi_access'
        WHEN event_type = 'PERMISSION_GRANTED' THEN 'permission_grant'
        WHEN event_type = 'PERMISSION_REVOKED' THEN 'permission_revoke'
        ELSE 'system_access'
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

-- Initialize security settings safely
SELECT public.initialize_security_settings();

-- Create enhanced breach detection function
CREATE OR REPLACE FUNCTION public.detect_security_breach(
    user_id_param uuid,
    detection_type text,
    risk_indicators jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    risk_score integer;
    severity_level text;
BEGIN
    -- Calculate risk score based on indicators
    risk_score := COALESCE((risk_indicators->>'risk_score')::integer, 50);
    
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
        threat_indicators,
        risk_score,
        automated_response
    ) VALUES (
        user_id_param,
        detection_type,
        severity_level,
        risk_indicators,
        risk_score,
        jsonb_build_object(
            'auto_detected', true,
            'detection_timestamp', NOW(),
            'requires_investigation', risk_score >= 60
        )
    );
    
    -- Log the breach detection
    PERFORM log_security_event_secure(
        'BREACH_DETECTED',
        CASE WHEN risk_score >= 60 THEN 'critical' ELSE 'warn' END,
        format('Security breach detected: %s', detection_type),
        jsonb_build_object(
            'risk_score', risk_score,
            'detection_type', detection_type,
            'user_id', user_id_param,
            'indicators', risk_indicators
        )
    );
END;
$$;

-- Create security configuration management function
CREATE OR REPLACE FUNCTION public.update_security_config(
    config_key_param text,
    config_value_param jsonb,
    updated_by_param uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user has permission to update security configs
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = updated_by_param 
        AND role IN ('admin', 'compliance')
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions to update security configuration';
    END IF;
    
    -- Update or insert configuration
    INSERT INTO security_configurations (
        config_key,
        config_value,
        updated_by,
        updated_at
    ) VALUES (
        config_key_param,
        config_value_param,
        updated_by_param,
        NOW()
    )
    ON CONFLICT (config_key) DO UPDATE SET
        config_value = EXCLUDED.config_value,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    
    -- Log configuration change
    PERFORM log_security_event_secure(
        'SECURITY_CONFIG_UPDATE',
        'info',
        format('Security configuration updated: %s', config_key_param),
        jsonb_build_object(
            'config_key', config_key_param,
            'new_value', config_value_param,
            'updated_by', updated_by_param
        )
    );
END;
$$;