-- Enhanced audit logging system for HIPAA compliance
-- This will track all PHI access and modifications

-- Create audit event types enum
CREATE TYPE audit_event_type AS ENUM (
  'login', 'logout', 'login_failed',
  'phi_access', 'phi_create', 'phi_update', 'phi_delete', 'phi_export',
  'permission_grant', 'permission_revoke', 'role_change',
  'system_access', 'configuration_change', 'backup_restore'
);

-- Create audit severity levels
CREATE TYPE audit_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- Enhanced audit logs table
CREATE TABLE IF NOT EXISTS enhanced_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type audit_event_type NOT NULL,
  severity audit_severity NOT NULL DEFAULT 'info',
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id UUID,
  phi_accessed BOOLEAN DEFAULT FALSE,
  action_performed TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  before_state JSONB,
  after_state JSONB,
  compliance_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retention_until TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_enhanced_audit_user_date ON enhanced_audit_logs (user_id, created_at);
CREATE INDEX idx_enhanced_audit_event_type ON enhanced_audit_logs (event_type, created_at);
CREATE INDEX idx_enhanced_audit_phi_access ON enhanced_audit_logs (phi_accessed, created_at);
CREATE INDEX idx_enhanced_audit_severity ON enhanced_audit_logs (severity, created_at);

-- Enable RLS on enhanced audit logs
ALTER TABLE enhanced_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and compliance officers can view audit logs
CREATE POLICY "audit_logs_admin_access" ON enhanced_audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'compliance')
  )
);

-- System can always insert audit logs
CREATE POLICY "audit_logs_system_insert" ON enhanced_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create audit log retention policy (7 years for HIPAA)
CREATE OR REPLACE FUNCTION set_audit_retention()
RETURNS TRIGGER AS $$
BEGIN
  NEW.retention_until := NEW.created_at + INTERVAL '7 years';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_audit_retention_trigger
  BEFORE INSERT ON enhanced_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_retention();