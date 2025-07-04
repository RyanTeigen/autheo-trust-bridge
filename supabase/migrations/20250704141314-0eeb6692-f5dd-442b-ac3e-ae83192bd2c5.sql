-- Update user roles to include compliance officer and admin roles
-- Add new roles for HIPAA compliance structure

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'compliance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auditor';

-- Create session management table for secure session handling
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT
);

-- Create indexes for session management
CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions (session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions (expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions (is_active, expires_at);

-- Enable RLS on sessions table
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "users_own_sessions" ON user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- System can manage all sessions
CREATE POLICY "system_manage_sessions" ON user_sessions
FOR ALL
USING (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = FALSE, 
      terminated_at = NOW(),
      termination_reason = 'expired'
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to extend session
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