
-- Phase 1: Critical Database Security Fixes

-- 1. Fix password complexity requirements
CREATE OR REPLACE FUNCTION validate_password_complexity(password text)
RETURNS boolean AS $$
BEGIN
    -- Check minimum length (8 characters)
    IF length(password) < 8 THEN
        RETURN false;
    END IF;
    
    -- Check for at least one uppercase letter
    IF NOT (password ~ '[A-Z]') THEN
        RETURN false;
    END IF;
    
    -- Check for at least one lowercase letter
    IF NOT (password ~ '[a-z]') THEN
        RETURN false;
    END IF;
    
    -- Check for at least one digit
    IF NOT (password ~ '[0-9]') THEN
        RETURN false;
    END IF;
    
    -- Check for at least one special character
    IF NOT (password ~ '[!@#$%^&*(),.?":{}|<>]') THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 2. Create user sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '8 hours',
    is_active BOOLEAN DEFAULT TRUE,
    terminated_at TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions"
ON user_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON user_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Create password history table to prevent reuse
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on password_history
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for password_history
CREATE POLICY "Users can view their own password history"
ON password_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert password history"
ON password_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Create security events table for monitoring
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_events
CREATE POLICY "Compliance officers can view all security events"
ON security_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('compliance', 'admin')
    )
);

CREATE POLICY "System can insert security events"
ON security_events FOR INSERT
WITH CHECK (TRUE);

-- 5. Create policy acknowledgments table
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    digital_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on policy_acknowledgments
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for policy_acknowledgments
CREATE POLICY "Users can view their own policy acknowledgments"
ON policy_acknowledgments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own policy acknowledgments"
ON policy_acknowledgments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Compliance officers can view all policy acknowledgments"
ON policy_acknowledgments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('compliance', 'admin')
    )
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_user_id ON policy_acknowledgments(user_id);

-- 7. Create function to check password history
CREATE OR REPLACE FUNCTION check_password_history(user_id_param UUID, new_password_hash TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    history_count INTEGER;
BEGIN
    -- Check if password was used in last 5 passwords
    SELECT COUNT(*) INTO history_count
    FROM password_history
    WHERE user_id = user_id_param
    AND password_hash = new_password_hash
    AND created_at > NOW() - INTERVAL '90 days';
    
    RETURN history_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS VOID AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = FALSE, 
        terminated_at = NOW(),
        termination_reason = 'expired'
    WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to extend session
CREATE OR REPLACE FUNCTION extend_session(session_token_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    session_found BOOLEAN := FALSE;
BEGIN
    UPDATE user_sessions 
    SET last_activity = NOW(),
        expires_at = NOW() + INTERVAL '8 hours'
    WHERE session_token = session_token_param 
    AND is_active = TRUE 
    AND expires_at > NOW();
    
    GET DIAGNOSTICS session_found = ROW_COUNT;
    RETURN session_found > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add trigger to audit policy acknowledgments
CREATE OR REPLACE FUNCTION audit_policy_acknowledgment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        resource_id,
        status,
        details,
        metadata
    ) VALUES (
        NEW.user_id,
        'POLICY_ACKNOWLEDGED',
        'policy_acknowledgments',
        NEW.id,
        'success',
        'User acknowledged HIPAA policy version ' || NEW.policy_version,
        jsonb_build_object(
            'policy_version', NEW.policy_version,
            'ip_address', NEW.ip_address,
            'user_agent', NEW.user_agent,
            'acknowledged_at', NEW.acknowledged_at
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_policy_acknowledgment
AFTER INSERT ON policy_acknowledgments
FOR EACH ROW EXECUTE FUNCTION audit_policy_acknowledgment();
