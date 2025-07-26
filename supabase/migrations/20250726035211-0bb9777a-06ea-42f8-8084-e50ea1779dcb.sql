-- Create security_events table for real-time security monitoring
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance_metrics_history for tracking compliance scores over time
CREATE TABLE public.compliance_metrics_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT DEFAULT 'percentage',
  category TEXT NOT NULL,
  subcategory TEXT,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_type TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_description TEXT,
  likelihood_description TEXT,
  mitigation_steps JSONB DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted')),
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_behavior_analytics table
CREATE TABLE public.user_behavior_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id TEXT,
  action_type TEXT NOT NULL,
  resource_accessed TEXT,
  access_pattern TEXT,
  anomaly_score NUMERIC DEFAULT 0,
  is_anomalous BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create incident_reports table (enhanced version)
CREATE TABLE public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_id UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  affected_systems JSONB DEFAULT '[]',
  affected_users_count INTEGER DEFAULT 0,
  estimated_impact TEXT,
  root_cause TEXT,
  resolution_steps JSONB DEFAULT '[]',
  lessons_learned TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Compliance can view all security events" 
ON public.security_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin', 'security')
));

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Compliance can update security events" 
ON public.security_events 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin', 'security')
));

-- RLS Policies for compliance_metrics_history
CREATE POLICY "Compliance can view all metrics history" 
ON public.compliance_metrics_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin')
));

CREATE POLICY "System can insert metrics history" 
ON public.compliance_metrics_history 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for risk_assessments
CREATE POLICY "Compliance can manage risk assessments" 
ON public.risk_assessments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin', 'security')
));

CREATE POLICY "Users can view assigned risk assessments" 
ON public.risk_assessments 
FOR SELECT 
USING (assigned_to = auth.uid());

-- RLS Policies for user_behavior_analytics
CREATE POLICY "Compliance can view behavior analytics" 
ON public.user_behavior_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin', 'security')
));

CREATE POLICY "System can insert behavior analytics" 
ON public.user_behavior_analytics 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for incident_reports
CREATE POLICY "Compliance can manage incident reports" 
ON public.incident_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin', 'security')
));

CREATE POLICY "Users can view assigned incident reports" 
ON public.incident_reports 
FOR SELECT 
USING (assigned_to = auth.uid() OR reporter_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON public.risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at
    BEFORE UPDATE ON public.incident_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial compliance metrics
INSERT INTO public.compliance_metrics_history (metric_type, metric_value, category, subcategory) VALUES
('overall_compliance', 94.5, 'compliance', 'overall'),
('privacy_controls', 96.2, 'compliance', 'privacy'),
('security_rules', 92.1, 'compliance', 'security'),
('access_controls', 95.8, 'compliance', 'access'),
('audit_logging', 98.5, 'compliance', 'audit'),
('data_encryption', 97.3, 'compliance', 'encryption');

-- Insert some sample security events
INSERT INTO public.security_events (event_type, severity, title, description, source, resource_type) VALUES
('login_anomaly', 'medium', 'Unusual login pattern detected', 'Multiple failed login attempts from different IP addresses', 'security_monitor', 'authentication'),
('data_access', 'low', 'Off-hours data access', 'Medical records accessed outside normal business hours', 'access_monitor', 'medical_records'),
('privilege_escalation', 'high', 'Unauthorized admin access attempt', 'User attempted to access admin-only resources', 'rbac_monitor', 'admin_panel');

-- Insert some sample risk assessments
INSERT INTO public.risk_assessments (assessment_type, risk_level, risk_score, title, description, impact_description, likelihood_description, status) VALUES
('security', 'medium', 65, 'Outdated encryption protocols', 'Some systems still using deprecated encryption methods', 'Potential data exposure in case of breach', 'Medium - systems are still functional but vulnerable', 'open'),
('compliance', 'low', 25, 'Documentation gaps', 'Some compliance documentation needs updating', 'Minor compliance score impact', 'Low - documentation is largely complete', 'in_progress'),
('operational', 'high', 80, 'Single point of failure in backup system', 'Backup system lacks redundancy', 'Complete data loss risk', 'High - no redundant backup system', 'open');

-- Insert some sample incident reports
INSERT INTO public.incident_reports (incident_type, severity, title, description, status, priority, affected_systems, affected_users_count, estimated_impact) VALUES
('security', 'medium', 'Suspicious login activity', 'Multiple failed login attempts detected from foreign IP addresses', 'investigating', 'high', '["authentication_system", "user_portal"]', 0, 'Potential account compromise attempts'),
('compliance', 'low', 'Audit log retention issue', 'Some audit logs were not properly retained according to policy', 'resolved', 'medium', '["audit_system"]', 0, 'Minor compliance violation'),
('technical', 'high', 'Database performance degradation', 'Slow query performance affecting user experience', 'open', 'urgent', '["database", "api_server"]', 150, 'Significant user experience impact');