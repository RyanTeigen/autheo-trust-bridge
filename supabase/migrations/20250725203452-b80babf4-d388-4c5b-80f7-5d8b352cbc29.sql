-- Security Enhancement Migration: Database Security Fixes
-- This migration implements security improvements identified in the security review

-- 1. Create security definer function for secure user role checking (prevents RLS infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role_secure()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 2. Create security definer function for checking user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission_secure(required_permission text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'compliance' OR role::text = required_permission)
    );
END;
$$;

-- 3. Create enhanced audit function with better security
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
$$;

-- 4. Enhanced session security table for better tracking
CREATE TABLE IF NOT EXISTS public.enhanced_user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    session_token text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    last_activity timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    ip_address inet,
    user_agent text,
    is_active boolean NOT NULL DEFAULT true,
    terminated_at timestamp with time zone,
    termination_reason text,
    security_flags jsonb DEFAULT '{}'::jsonb,
    device_fingerprint text,
    location_data jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on enhanced sessions
ALTER TABLE public.enhanced_user_sessions ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Users can view their own sessions" ON public.enhanced_user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.enhanced_user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.enhanced_user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Security configuration table for centralized security settings
CREATE TABLE IF NOT EXISTS public.security_configurations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key text NOT NULL UNIQUE,
    config_value jsonb NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid
);

-- Enable RLS on security configurations
ALTER TABLE public.security_configurations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security configurations
CREATE POLICY "Only admins can manage security configs" ON public.security_configurations
    FOR ALL USING (get_current_user_role_secure() = 'admin');

-- Insert default security configurations
INSERT INTO public.security_configurations (config_key, config_value, description) VALUES
('session_timeout_minutes', '480', 'Default session timeout in minutes'),
('max_failed_login_attempts', '5', 'Maximum failed login attempts before account lock'),
('password_min_length', '12', 'Minimum password length requirement'),
('require_mfa', 'false', 'Whether MFA is required for all users'),
('session_rotation_interval', '60', 'Session token rotation interval in minutes'),
('audit_retention_years', '7', 'Audit log retention period in years'),
('encryption_key_rotation_days', '90', 'Encryption key rotation interval in days')
ON CONFLICT (config_key) DO NOTHING;

-- 6. Enhanced breach detection with better categorization
CREATE TABLE IF NOT EXISTS public.enhanced_breach_detection (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    detection_type text NOT NULL,
    severity_level text NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    threat_indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
    risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
    detected_at timestamp with time zone NOT NULL DEFAULT now(),
    resolved_at timestamp with time zone,
    resolution_notes text,
    false_positive boolean DEFAULT false,
    automated_response jsonb DEFAULT '{}'::jsonb,
    affected_resources text[],
    mitigation_status text DEFAULT 'open' CHECK (mitigation_status IN ('open', 'investigating', 'mitigated', 'closed'))
);

-- Enable RLS on enhanced breach detection
ALTER TABLE public.enhanced_breach_detection ENABLE ROW LEVEL SECURITY;

-- Only security personnel can access breach detection data
CREATE POLICY "Security personnel can access breach detection" ON public.enhanced_breach_detection
    FOR ALL USING (
        get_current_user_role_secure() IN ('admin', 'compliance', 'security')
    );

-- 7. Update all existing functions to use SET search_path = public for security
CREATE OR REPLACE FUNCTION public.update_medical_records_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_sharing_permissions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 8. Create automatic session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions_enhanced()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update expired sessions
    UPDATE enhanced_user_sessions 
    SET is_active = false, 
        terminated_at = NOW(),
        termination_reason = 'expired'
    WHERE expires_at < NOW() AND is_active = true;
    
    -- Log cleanup activity
    PERFORM log_security_event_secure(
        'SESSION_CLEANUP',
        'info',
        'Automatic cleanup of expired sessions',
        jsonb_build_object('cleaned_sessions', (SELECT count(*) FROM enhanced_user_sessions WHERE terminated_at = NOW() AND termination_reason = 'expired'))
    );
END;
$$;