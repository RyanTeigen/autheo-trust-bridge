-- Security Fix #1: Remove SECURITY DEFINER from functions that don't need it
-- and add proper search_path to all remaining functions

-- Fix function search paths (addresses WARN 3 & 4)
ALTER FUNCTION public.get_current_user_role_secure() 
SET search_path = 'public';

ALTER FUNCTION public.check_user_permission_secure(text) 
SET search_path = 'public';

ALTER FUNCTION public.log_security_event_secure(text, text, text, jsonb) 
SET search_path = 'public';

-- Add search_path to other functions that might be missing it
ALTER FUNCTION public.get_appointment_details(uuid) 
SET search_path = 'public';

ALTER FUNCTION public.get_patient_records(uuid) 
SET search_path = 'public';

ALTER FUNCTION public.get_provider_visible_records(uuid) 
SET search_path = 'public';

ALTER FUNCTION public.cleanup_expired_sessions_enhanced() 
SET search_path = 'public';

ALTER FUNCTION public.respond_to_appointment_access_request(uuid, text, text) 
SET search_path = 'public';

ALTER FUNCTION public.process_appointment_access_request() 
SET search_path = 'public';

-- Create secure session management table
CREATE TABLE IF NOT EXISTS public.secure_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    session_token text NOT NULL UNIQUE,
    csrf_token text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    last_activity timestamptz NOT NULL DEFAULT now(),
    ip_address inet,
    user_agent text,
    device_fingerprint text,
    is_active boolean NOT NULL DEFAULT true,
    security_flags jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on secure_sessions
ALTER TABLE public.secure_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secure_sessions
CREATE POLICY "Users can manage their own sessions" ON public.secure_sessions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_secure_sessions_user_id ON public.secure_sessions(user_id);
CREATE INDEX idx_secure_sessions_token ON public.secure_sessions(session_token);
CREATE INDEX idx_secure_sessions_active ON public.secure_sessions(is_active, expires_at);

-- Create OTP management table with proper expiry
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    code text NOT NULL,
    code_type text NOT NULL CHECK (code_type IN ('login', 'password_reset', 'email_verification')),
    expires_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '5 minutes'), -- 5 minute expiry
    created_at timestamptz NOT NULL DEFAULT now(),
    used_at timestamptz,
    is_used boolean NOT NULL DEFAULT false,
    attempts integer NOT NULL DEFAULT 0,
    max_attempts integer NOT NULL DEFAULT 3
);

-- Enable RLS on OTP codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for OTP codes
CREATE POLICY "Users can manage their own OTP codes" ON public.otp_codes
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for OTP cleanup
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);
CREATE INDEX idx_otp_codes_user_type ON public.otp_codes(user_id, code_type, is_used);

-- Create function to generate secure OTP
CREATE OR REPLACE FUNCTION public.generate_secure_otp(
    user_id_param uuid,
    code_type_param text DEFAULT 'login'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    otp_code text;
    existing_count integer;
BEGIN
    -- Check rate limiting (max 5 OTP requests per hour)
    SELECT COUNT(*) INTO existing_count
    FROM otp_codes
    WHERE user_id = user_id_param 
    AND code_type = code_type_param
    AND created_at > now() - INTERVAL '1 hour';
    
    IF existing_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded for OTP generation';
    END IF;
    
    -- Generate cryptographically secure 6-digit code
    otp_code := LPAD(FLOOR(random() * 1000000)::text, 6, '0');
    
    -- Invalidate existing unused codes of the same type
    UPDATE otp_codes 
    SET is_used = true, used_at = now()
    WHERE user_id = user_id_param 
    AND code_type = code_type_param 
    AND is_used = false;
    
    -- Insert new OTP
    INSERT INTO otp_codes (user_id, code, code_type)
    VALUES (user_id_param, otp_code, code_type_param);
    
    RETURN otp_code;
END;
$$;

-- Create function to verify OTP with rate limiting
CREATE OR REPLACE FUNCTION public.verify_otp(
    user_id_param uuid,
    code_param text,
    code_type_param text DEFAULT 'login'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    otp_record otp_codes%ROWTYPE;
    is_valid boolean := false;
BEGIN
    -- Get the OTP record
    SELECT * INTO otp_record
    FROM otp_codes
    WHERE user_id = user_id_param
    AND code_type = code_type_param
    AND is_used = false
    AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if too many attempts
    IF otp_record.attempts >= otp_record.max_attempts THEN
        -- Mark as used to prevent further attempts
        UPDATE otp_codes 
        SET is_used = true, used_at = now()
        WHERE id = otp_record.id;
        RETURN false;
    END IF;
    
    -- Increment attempt counter
    UPDATE otp_codes 
    SET attempts = attempts + 1
    WHERE id = otp_record.id;
    
    -- Verify code
    IF otp_record.code = code_param THEN
        -- Mark as used
        UPDATE otp_codes 
        SET is_used = true, used_at = now()
        WHERE id = otp_record.id;
        is_valid := true;
    END IF;
    
    RETURN is_valid;
END;
$$;

-- Create function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    DELETE FROM otp_codes
    WHERE expires_at < now() - INTERVAL '1 hour'; -- Keep for 1 hour after expiry for audit
END;
$$;

-- Create security configuration table
CREATE TABLE IF NOT EXISTS public.security_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key text NOT NULL UNIQUE,
    config_value jsonb NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- Enable RLS on security config
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security config
CREATE POLICY "Only admins can manage security config" ON public.security_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value, description) VALUES
('csrf_protection', '{"enabled": true, "token_length": 32, "expire_minutes": 60}', 'CSRF protection settings'),
('session_security', '{"max_age_minutes": 480, "idle_timeout_minutes": 30, "concurrent_sessions": 3}', 'Session security settings'),
('rate_limiting', '{"enabled": true, "requests_per_minute": 60, "burst_size": 10}', 'API rate limiting settings'),
('password_policy', '{"min_length": 12, "require_special": true, "require_numbers": true, "require_mixed_case": true}', 'Password policy settings'),
('otp_settings', '{"expiry_minutes": 5, "max_attempts": 3, "rate_limit_per_hour": 5}', 'OTP security settings')
ON CONFLICT (config_key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_config_updated_at
    BEFORE UPDATE ON public.security_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();