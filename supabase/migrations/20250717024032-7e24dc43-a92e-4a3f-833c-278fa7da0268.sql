-- Enhance sharing_permissions table for better workflow management
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS request_type text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS urgency_level text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS hospital_id text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS clinical_justification text,
ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reminder_sent timestamptz;

-- Update the status check constraint to include new statuses
ALTER TABLE sharing_permissions 
DROP CONSTRAINT IF EXISTS sharing_permissions_status_check;

ALTER TABLE sharing_permissions 
ADD CONSTRAINT sharing_permissions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'expired', 'under_review', 'awaiting_patient_response'));

-- Add request type constraint
ALTER TABLE sharing_permissions 
ADD CONSTRAINT sharing_permissions_request_type_check 
CHECK (request_type IN ('standard', 'emergency', 'cross_hospital', 'research', 'consultation'));

-- Add urgency level constraint
ALTER TABLE sharing_permissions 
ADD CONSTRAINT sharing_permissions_urgency_level_check 
CHECK (urgency_level IN ('low', 'normal', 'high', 'critical'));

-- Create patient notifications table
CREATE TABLE IF NOT EXISTS patient_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  priority text DEFAULT 'normal',
  CONSTRAINT patient_notifications_type_check CHECK (notification_type IN ('access_request', 'access_granted', 'access_revoked', 'reminder', 'urgent')),
  CONSTRAINT patient_notifications_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Enable RLS for patient notifications
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own notifications
CREATE POLICY "Patients can view own notifications" ON patient_notifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = patient_notifications.patient_id 
    AND patients.user_id = auth.uid()
  )
);

-- Patients can update their own notifications (mark as read)
CREATE POLICY "Patients can update own notifications" ON patient_notifications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = patient_notifications.patient_id 
    AND patients.user_id = auth.uid()
  )
);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON patient_notifications
FOR INSERT WITH CHECK (true);

-- Create workflow automation rules table
CREATE TABLE IF NOT EXISTS workflow_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  CONSTRAINT workflow_rules_type_check CHECK (rule_type IN ('auto_approval', 'reminder', 'escalation', 'notification'))
);

-- Enable RLS for workflow rules
ALTER TABLE workflow_automation_rules ENABLE ROW LEVEL SECURITY;

-- Only admins can manage workflow rules
CREATE POLICY "Admins can manage workflow rules" ON workflow_automation_rules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create access request audit trail
CREATE TABLE IF NOT EXISTS access_request_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES sharing_permissions(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_status text,
  new_status text,
  performed_by uuid REFERENCES profiles(id),
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT audit_action_check CHECK (action IN ('created', 'status_changed', 'approved', 'rejected', 'revoked', 'reminded', 'escalated'))
);

-- Enable RLS for audit trail
ALTER TABLE access_request_audit ENABLE ROW LEVEL SECURITY;

-- Providers and patients can view audit trail for their requests
CREATE POLICY "View own request audit trail" ON access_request_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sharing_permissions sp
    WHERE sp.id = access_request_audit.request_id
    AND (sp.grantee_id = auth.uid() OR sp.patient_id IN (
      SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
    ))
  )
);

-- System can insert audit records
CREATE POLICY "System can insert audit records" ON access_request_audit
FOR INSERT WITH CHECK (true);

-- Create function to automatically update sharing_permissions updated_at
CREATE OR REPLACE FUNCTION update_sharing_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_sharing_permissions_updated_at_trigger ON sharing_permissions;
CREATE TRIGGER update_sharing_permissions_updated_at_trigger
  BEFORE UPDATE ON sharing_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_sharing_permissions_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_id ON patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_created_at ON patient_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_is_read ON patient_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_status ON sharing_permissions(status);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_request_type ON sharing_permissions(request_type);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_urgency ON sharing_permissions(urgency_level);
CREATE INDEX IF NOT EXISTS idx_access_request_audit_request_id ON access_request_audit(request_id);
CREATE INDEX IF NOT EXISTS idx_access_request_audit_created_at ON access_request_audit(created_at DESC);