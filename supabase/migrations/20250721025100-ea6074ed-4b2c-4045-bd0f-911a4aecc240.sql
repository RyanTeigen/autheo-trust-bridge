
-- Phase 1: Database Security Fixes and Enhanced Audit Trail

-- 1. Add missing columns to audit_logs table for comprehensive tracking
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS phi_accessed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minimum_necessary_justification TEXT,
ADD COLUMN IF NOT EXISTS access_purpose TEXT,
ADD COLUMN IF NOT EXISTS data_categories TEXT[],
ADD COLUMN IF NOT EXISTS retention_period INTERVAL DEFAULT INTERVAL '7 years';

-- 2. Create breach detection table
CREATE TABLE IF NOT EXISTS breach_detection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  auto_detected BOOLEAN DEFAULT TRUE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for breach detection
ALTER TABLE breach_detection_events ENABLE ROW LEVEL SECURITY;

-- Policy for compliance officers and admins to view breach events
CREATE POLICY "Compliance can view breach events"
ON breach_detection_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- Policy for system to insert breach events
CREATE POLICY "System can insert breach events"
ON breach_detection_events
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Create minimum necessary access controls table
CREATE TABLE IF NOT EXISTS minimum_necessary_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  allowed_fields TEXT[] NOT NULL,
  business_justification TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_role, resource_type)
);

-- Enable RLS for minimum necessary controls
ALTER TABLE minimum_necessary_controls ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage minimum necessary controls
CREATE POLICY "Admins can manage minimum necessary controls"
ON minimum_necessary_controls
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for all authenticated users to read controls
CREATE POLICY "Users can read minimum necessary controls"
ON minimum_necessary_controls
FOR SELECT
USING (auth.role() = 'authenticated');

-- 4. Create patient rights tracking table
CREATE TABLE IF NOT EXISTS patient_rights_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'amendment', 'restriction', 'accounting', 'portability')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'denied')),
  description TEXT,
  requested_data TEXT[],
  justification TEXT,
  response_due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  handled_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for patient rights requests
ALTER TABLE patient_rights_requests ENABLE ROW LEVEL SECURITY;

-- Policy for patients to create and view their own requests
CREATE POLICY "Patients can manage their rights requests"
ON patient_rights_requests
FOR ALL
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Policy for compliance officers to view and handle requests
CREATE POLICY "Compliance can handle patient rights requests"
ON patient_rights_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- 5. Create administrative safeguards table
CREATE TABLE IF NOT EXISTS administrative_safeguards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safeguard_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_status TEXT NOT NULL DEFAULT 'pending' CHECK (implementation_status IN ('pending', 'in_progress', 'completed', 'not_applicable')),
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  evidence_location TEXT,
  review_frequency INTERVAL,
  last_reviewed TIMESTAMPTZ,
  next_review_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for administrative safeguards
ALTER TABLE administrative_safeguards ENABLE ROW LEVEL SECURITY;

-- Policy for compliance officers and admins to manage safeguards
CREATE POLICY "Compliance can manage administrative safeguards"
ON administrative_safeguards
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- 6. Insert initial minimum necessary controls
INSERT INTO minimum_necessary_controls (user_role, resource_type, allowed_fields, business_justification) VALUES
('patient', 'medical_records', ARRAY['id', 'record_type', 'created_at', 'updated_at'], 'Patients can access their own medical record metadata'),
('provider', 'medical_records', ARRAY['id', 'patient_id', 'record_type', 'encrypted_data', 'created_at', 'provider_id'], 'Providers need access to patient records for treatment'),
('compliance', 'audit_logs', ARRAY['id', 'user_id', 'action', 'resource', 'timestamp', 'phi_accessed'], 'Compliance officers need audit trail access for monitoring'),
('admin', 'all_tables', ARRAY['*'], 'Administrators require full access for system management');

-- 7. Insert initial administrative safeguards
INSERT INTO administrative_safeguards (safeguard_type, title, description, implementation_status, review_frequency) VALUES
('assigned_security_responsibility', 'Information Security Officer', 'Assign a security officer responsible for developing and implementing security policies', 'completed', INTERVAL '1 year'),
('workforce_training', 'HIPAA Training Program', 'Conduct regular HIPAA training for all workforce members', 'in_progress', INTERVAL '1 year'),
('information_access_management', 'Access Control Procedures', 'Implement procedures for granting access to PHI', 'completed', INTERVAL '6 months'),
('security_awareness', 'Security Awareness Program', 'Conduct periodic security updates and reminders', 'in_progress', INTERVAL '3 months'),
('incident_procedures', 'Security Incident Response', 'Document procedures for reporting and responding to security incidents', 'completed', INTERVAL '1 year'),
('contingency_plan', 'Data Backup and Recovery', 'Establish data backup and disaster recovery procedures', 'in_progress', INTERVAL '1 year'),
('audit_controls', 'Audit Log Review', 'Regular review of audit logs and access patterns', 'completed', INTERVAL '1 month');

-- 8. Add trigger for automatic breach detection
CREATE OR REPLACE FUNCTION detect_potential_breaches()
RETURNS TRIGGER AS $$
DECLARE
    recent_access_count INTEGER;
    user_role TEXT;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM profiles WHERE id = NEW.user_id;
    
    -- Check for excessive access patterns
    SELECT COUNT(*) INTO recent_access_count
    FROM audit_logs
    WHERE user_id = NEW.user_id
    AND timestamp > NOW() - INTERVAL '1 hour'
    AND action LIKE '%ACCESS%';
    
    -- If more than 50 accesses in an hour, flag as potential breach
    IF recent_access_count > 50 THEN
        INSERT INTO breach_detection_events (
            user_id,
            event_type,
            severity,
            description,
            metadata
        ) VALUES (
            NEW.user_id,
            'excessive_access',
            'high',
            'User accessed resources ' || recent_access_count || ' times in the last hour',
            jsonb_build_object('access_count', recent_access_count, 'user_role', user_role)
        );
    END IF;
    
    -- Check for unauthorized PHI access
    IF NEW.phi_accessed = TRUE AND user_role NOT IN ('provider', 'compliance', 'admin') THEN
        INSERT INTO breach_detection_events (
            user_id,
            event_type,
            severity,
            description,
            metadata
        ) VALUES (
            NEW.user_id,
            'unauthorized_phi_access',
            'critical',
            'User with role ' || user_role || ' accessed PHI without proper authorization',
            jsonb_build_object('resource', NEW.resource, 'user_role', user_role)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for breach detection
DROP TRIGGER IF EXISTS audit_breach_detection ON audit_logs;
CREATE TRIGGER audit_breach_detection
    AFTER INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION detect_potential_breaches();

-- 9. Update audit log retention trigger
CREATE OR REPLACE FUNCTION set_audit_retention()
RETURNS TRIGGER AS $$
BEGIN
    -- Set retention period based on data type
    IF NEW.phi_accessed = TRUE THEN
        NEW.retention_period := INTERVAL '7 years';
    ELSE
        NEW.retention_period := INTERVAL '3 years';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit retention
DROP TRIGGER IF EXISTS set_audit_retention_trigger ON audit_logs;
CREATE TRIGGER set_audit_retention_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_retention();

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi_accessed ON audit_logs(phi_accessed);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_breach_detection_severity ON breach_detection_events(severity);
CREATE INDEX IF NOT EXISTS idx_breach_detection_resolved ON breach_detection_events(resolved);
CREATE INDEX IF NOT EXISTS idx_patient_rights_status ON patient_rights_requests(status);
CREATE INDEX IF NOT EXISTS idx_patient_rights_due_date ON patient_rights_requests(response_due_date);
