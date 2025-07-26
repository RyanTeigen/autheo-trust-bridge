-- RLS Policies for security_events (updated to use valid roles)
CREATE POLICY "Compliance can view all security events" 
ON public.security_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('compliance', 'admin')
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
  AND role IN ('compliance', 'admin')
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
  AND role IN ('compliance', 'admin')
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
  AND role IN ('compliance', 'admin')
));

CREATE POLICY "System can insert behavior analytics" 
ON public.user_behavior_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON public.risk_assessments
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