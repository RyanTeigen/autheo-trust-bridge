-- Create enhanced audit logs table for HIPAA compliance
CREATE TABLE public.enhanced_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  phi_accessed BOOLEAN NOT NULL DEFAULT FALSE,
  action_performed TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  before_state JSONB DEFAULT '{}',
  after_state JSONB DEFAULT '{}',
  compliance_flags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retention_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.enhanced_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs access
CREATE POLICY "Admin users can view all audit logs" 
ON public.enhanced_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'compliance', 'auditor')
  )
);

-- Create index for better performance
CREATE INDEX idx_enhanced_audit_logs_user_id ON public.enhanced_audit_logs(user_id);
CREATE INDEX idx_enhanced_audit_logs_created_at ON public.enhanced_audit_logs(created_at);
CREATE INDEX idx_enhanced_audit_logs_event_type ON public.enhanced_audit_logs(event_type);
CREATE INDEX idx_enhanced_audit_logs_phi_accessed ON public.enhanced_audit_logs(phi_accessed);

-- Create trigger to set retention period
CREATE TRIGGER set_enhanced_audit_retention
  BEFORE INSERT ON public.enhanced_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_audit_retention();