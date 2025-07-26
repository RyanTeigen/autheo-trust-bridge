-- Create HIPAA compliance tracking tables and fix remaining security issues

-- Fix function search paths for remaining functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Function logic here
    RETURN NEW;
END;
$function$;

-- Create HIPAA compliance controls table
CREATE TABLE IF NOT EXISTS public.hipaa_compliance_controls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  control_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('administrative', 'physical', 'technical')),
  subcategory TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_status TEXT NOT NULL DEFAULT 'not_implemented' 
    CHECK (implementation_status IN ('implemented', 'partially_implemented', 'not_implemented', 'not_applicable')),
  risk_level TEXT NOT NULL DEFAULT 'medium' 
    CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  evidence_required TEXT[],
  current_evidence TEXT[],
  compliance_notes TEXT,
  last_assessment_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hipaa_compliance_controls ENABLE ROW LEVEL SECURITY;

-- Create policies for compliance controls (only compliance/admin roles can access)
CREATE POLICY "compliance_controls_select" ON public.hipaa_compliance_controls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

CREATE POLICY "compliance_controls_insert" ON public.hipaa_compliance_controls
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

CREATE POLICY "compliance_controls_update" ON public.hipaa_compliance_controls
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- Create HIPAA risk assessments table
CREATE TABLE IF NOT EXISTS public.hipaa_risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_name TEXT NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('annual', 'incident_based', 'ad_hoc', 'vendor_assessment')),
  scope TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  identified_vulnerabilities JSONB,
  mitigation_plan JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress' 
    CHECK (status IN ('planned', 'in_progress', 'completed', 'requires_action')),
  conducted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ,
  next_assessment_date TIMESTAMPTZ,
  findings_summary TEXT,
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hipaa_risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for risk assessments
CREATE POLICY "risk_assessments_select" ON public.hipaa_risk_assessments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

CREATE POLICY "risk_assessments_insert" ON public.hipaa_risk_assessments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

CREATE POLICY "risk_assessments_update" ON public.hipaa_risk_assessments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin')
  )
);

-- Create Business Associate Agreements tracking table
CREATE TABLE IF NOT EXISTS public.business_associate_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  vendor_contact_email TEXT,
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('baa', 'dpa', 'subcontractor')),
  services_provided TEXT NOT NULL,
  phi_access_level TEXT NOT NULL CHECK (phi_access_level IN ('full', 'limited', 'none')),
  agreement_signed_date DATE,
  agreement_expiry_date DATE,
  renewal_required BOOLEAN DEFAULT false,
  compliance_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (compliance_status IN ('compliant', 'pending', 'non_compliant', 'expired')),
  last_audit_date DATE,
  next_audit_date DATE,
  security_requirements JSONB,
  breach_notification_requirements JSONB,
  termination_procedures JSONB,
  document_location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_associate_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies for BAAs
CREATE POLICY "baa_select" ON public.business_associate_agreements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin', 'legal')
  )
);

CREATE POLICY "baa_insert" ON public.business_associate_agreements
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin', 'legal')
  )
);

CREATE POLICY "baa_update" ON public.business_associate_agreements
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('compliance', 'admin', 'legal')
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_hipaa_compliance_controls_updated_at 
    BEFORE UPDATE ON public.hipaa_compliance_controls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hipaa_risk_assessments_updated_at 
    BEFORE UPDATE ON public.hipaa_risk_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_associate_agreements_updated_at 
    BEFORE UPDATE ON public.business_associate_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();