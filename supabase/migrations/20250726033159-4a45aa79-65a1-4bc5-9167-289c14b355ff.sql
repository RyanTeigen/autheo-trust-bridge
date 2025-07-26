-- Phase 2: Policy Management & Enhanced Audit Trail

-- Create policy management tables
CREATE TABLE IF NOT EXISTS public.compliance_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('hipaa', 'phipa', 'privacy', 'security', 'operational')),
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'under_review')),
  effective_date DATE,
  review_date DATE,
  approval_date DATE,
  approved_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  content JSONB NOT NULL DEFAULT '{}',
  acknowledgment_required BOOLEAN DEFAULT true,
  auto_assignment_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policy acknowledgments tracking
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledgment_method TEXT DEFAULT 'digital_signature',
  ip_address INET,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(policy_id, user_id, is_current)
);

-- Create training modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  module_type TEXT NOT NULL CHECK (module_type IN ('compliance', 'security', 'privacy', 'operational')),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in minutes
  required_for_roles TEXT[],
  prerequisites TEXT[],
  certification_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training completions tracking
CREATE TABLE IF NOT EXISTS public.training_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN DEFAULT false,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_id TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create compliance violations tracking
CREATE TABLE IF NOT EXISTS public.compliance_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL, -- system, manual, audit, etc.
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT,
  resource_id UUID,
  description TEXT NOT NULL,
  remediation_steps JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Compliance policies - admin/compliance can manage, all users can view active policies
CREATE POLICY "compliance_admin_full_access" ON public.compliance_policies
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('compliance', 'admin'))
);

CREATE POLICY "users_view_active_policies" ON public.compliance_policies
FOR SELECT USING (status = 'active');

-- Policy acknowledgments - users can view/create their own
CREATE POLICY "users_own_acknowledgments" ON public.policy_acknowledgments
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "compliance_view_all_acknowledgments" ON public.policy_acknowledgments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('compliance', 'admin'))
);

-- Training modules - similar to policies
CREATE POLICY "training_admin_full_access" ON public.training_modules
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('compliance', 'admin'))
);

CREATE POLICY "users_view_active_training" ON public.training_modules
FOR SELECT USING (status = 'active');

-- Training completions - users own, compliance can view all
CREATE POLICY "users_own_training_completions" ON public.training_completions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "compliance_view_all_completions" ON public.training_completions
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('compliance', 'admin'))
);

-- Compliance violations - compliance/admin can manage all
CREATE POLICY "compliance_manage_violations" ON public.compliance_violations
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('compliance', 'admin'))
);

-- Add updated_at triggers
CREATE TRIGGER update_compliance_policies_updated_at 
    BEFORE UPDATE ON public.compliance_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at 
    BEFORE UPDATE ON public.training_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_violations_updated_at 
    BEFORE UPDATE ON public.compliance_violations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();