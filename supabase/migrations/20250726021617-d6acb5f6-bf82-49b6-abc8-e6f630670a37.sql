-- Complete security database fixes
-- Create the security initialization function properly

CREATE OR REPLACE FUNCTION public.initialize_security_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Log security initialization using system_access event
  PERFORM log_security_event_secure(
    'SECURITY_INIT',
    'info',
    'Security settings initialized and configured',
    jsonb_build_object('timestamp', NOW(), 'action', 'configuration_update')
  );
END;
$$;

-- Now run the initialization
SELECT public.initialize_security_settings();

-- Create session management trigger for automatic cleanup
CREATE OR REPLACE FUNCTION public.trigger_session_cleanup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Automatically mark sessions as inactive when they expire
    NEW.is_active := CASE 
        WHEN NEW.expires_at <= NOW() THEN false 
        ELSE NEW.is_active 
    END;
    
    NEW.terminated_at := CASE 
        WHEN NEW.expires_at <= NOW() AND OLD.is_active = true THEN NOW()
        ELSE NEW.terminated_at
    END;
    
    NEW.termination_reason := CASE 
        WHEN NEW.expires_at <= NOW() AND OLD.is_active = true THEN 'expired'
        ELSE NEW.termination_reason
    END;
    
    RETURN NEW;
END;
$$;

-- Create trigger for session cleanup
DROP TRIGGER IF EXISTS session_auto_cleanup ON enhanced_user_sessions;
CREATE TRIGGER session_auto_cleanup
    BEFORE UPDATE ON enhanced_user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_session_cleanup();

-- Create security metrics view for monitoring
CREATE OR REPLACE VIEW security_metrics AS
SELECT 
    date_trunc('hour', created_at) as hour,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE severity = 'high') as high_events,
    COUNT(*) FILTER (WHERE event_type = 'login') as login_events,
    COUNT(*) FILTER (WHERE event_type = 'login_failed') as failed_login_events,
    COUNT(*) FILTER (WHERE event_type = 'phi_access') as phi_access_events
FROM enhanced_audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY date_trunc('hour', created_at)
ORDER BY hour DESC;

-- Grant access to security metrics for compliance users
GRANT SELECT ON security_metrics TO authenticated;

-- Create function to get security status
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    active_sessions integer;
    recent_breaches integer;
    failed_logins integer;
    critical_events integer;
    status_level text;
    recommendations text[];
BEGIN
    -- Count active sessions
    SELECT COUNT(*) INTO active_sessions
    FROM enhanced_user_sessions
    WHERE is_active = true AND expires_at > NOW();
    
    -- Count recent security breaches
    SELECT COUNT(*) INTO recent_breaches
    FROM enhanced_breach_detection
    WHERE detected_at > NOW() - INTERVAL '24 hours'
    AND mitigation_status = 'open';
    
    -- Count failed logins in last hour
    SELECT COUNT(*) INTO failed_logins
    FROM enhanced_audit_logs
    WHERE event_type = 'login_failed'
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Count critical security events in last 24 hours
    SELECT COUNT(*) INTO critical_events
    FROM enhanced_audit_logs
    WHERE severity = 'critical'
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Determine overall security status
    status_level := CASE 
        WHEN critical_events > 0 OR recent_breaches > 0 THEN 'critical'
        WHEN failed_logins > 10 THEN 'warning'
        ELSE 'secure'
    END;
    
    -- Generate recommendations
    recommendations := ARRAY[]::text[];
    
    IF recent_breaches > 0 THEN
        recommendations := array_append(recommendations, 'Investigate and resolve open security breaches');
    END IF;
    
    IF failed_logins > 5 THEN
        recommendations := array_append(recommendations, 'Monitor for potential brute force attacks');
    END IF;
    
    IF critical_events > 0 THEN
        recommendations := array_append(recommendations, 'Review critical security events from the last 24 hours');
    END IF;
    
    IF active_sessions > 100 THEN
        recommendations := array_append(recommendations, 'High number of active sessions detected');
    END IF;
    
    RETURN jsonb_build_object(
        'status', status_level,
        'active_sessions', active_sessions,
        'recent_breaches', recent_breaches,
        'failed_logins_last_hour', failed_logins,
        'critical_events_24h', critical_events,
        'recommendations', recommendations,
        'last_updated', NOW()
    );
END;
$$;