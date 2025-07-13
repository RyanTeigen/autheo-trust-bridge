-- Create policy acknowledgments table for HIPAA compliance
CREATE TABLE public.policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one acknowledgment per user per policy version
  UNIQUE(user_id, policy_version)
);

-- Enable Row Level Security
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own policy acknowledgments"
  ON public.policy_acknowledgments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy acknowledgments"
  ON public.policy_acknowledgments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and compliance can view all acknowledgments"
  ON public.policy_acknowledgments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'compliance')
    )
  );

-- Create index for performance
CREATE INDEX idx_policy_acknowledgments_user_id ON public.policy_acknowledgments(user_id);
CREATE INDEX idx_policy_acknowledgments_version ON public.policy_acknowledgments(policy_version);

-- Create audit trigger for compliance tracking
CREATE OR REPLACE FUNCTION public.audit_policy_acknowledgment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
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
    NEW.id::TEXT,
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

CREATE TRIGGER audit_policy_acknowledgment_trigger
  AFTER INSERT ON public.policy_acknowledgments
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_policy_acknowledgment();