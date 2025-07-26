-- Fix security issues identified by linter

-- Fix OTP expiry time (reduce from 15 minutes to 5 minutes for better security)
UPDATE auth.config 
SET auth_otp_exp = 300  -- 5 minutes in seconds
WHERE TRUE;

-- Enable leaked password protection
UPDATE auth.config 
SET enable_password_check = true
WHERE TRUE;

-- Fix function search paths (these need to be addressed to prevent security issues)
-- Update functions to have proper search_path set
CREATE OR REPLACE FUNCTION public.create_sharing_permission_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  patient_name TEXT;
  provider_name TEXT;
BEGIN
  -- Only create notification if status changed to approved or denied
  IF NEW.status IN ('approved', 'rejected') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name for context
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.grantee_id;
    
    -- Insert notification for the provider (grantee)
    INSERT INTO provider_notifications (
      provider_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.grantee_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'access_granted'
        ELSE 'access_denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN '✅ Access Request Approved'
        ELSE '❌ Access Request Denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 
          format('Patient %s has approved your access request. You can now view their medical records.',
            COALESCE(patient_name, 'Unknown Patient'))
        ELSE 
          format('Patient %s has denied your access request for medical records.',
            COALESCE(patient_name, 'Unknown Patient'))
      END,
      'normal',
      jsonb_build_object(
        'sharing_permission_id', NEW.id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'medical_record_id', NEW.medical_record_id,
        'permission_type', NEW.permission_type,
        'status', NEW.status,
        'decision_date', NEW.updated_at,
        'request_type', 'in_hospital'
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_appointment_access_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  patient_name TEXT;
  provider_name TEXT;
  appointment_info RECORD;
BEGIN
  -- Only create notification when access is granted (not when initially created)
  IF NEW.access_granted = true AND (OLD.access_granted IS NULL OR OLD.access_granted = false) THEN
    
    -- Get appointment information
    SELECT * INTO appointment_info
    FROM enhanced_appointments 
    WHERE id = NEW.appointment_id;
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name for context
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.provider_id;
    
    -- Insert notification for the provider
    INSERT INTO provider_notifications (
      provider_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.provider_id,
      'access_granted',
      '✅ Appointment Access Approved',
      format('Patient %s has approved your access request for their %s appointment on %s. You can now view their medical records.',
        COALESCE(patient_name, 'Unknown Patient'),
        COALESCE(appointment_info.appointment_type, 'scheduled'),
        TO_CHAR(appointment_info.appointment_date, 'Mon DD, YYYY at HH12:MI AM')
      ),
      CASE 
        WHEN appointment_info.urgency_level = 'urgent' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'appointment_id', NEW.appointment_id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'appointment_type', appointment_info.appointment_type,
        'appointment_date', appointment_info.appointment_date,
        'access_expires_at', NEW.access_expires_at,
        'request_type', 'appointment_access'
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create HIPAA compliance tracking tables
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hipaa_compliance_controls_updated_at 
    BEFORE UPDATE ON public.hipaa_compliance_controls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hipaa_risk_assessments_updated_at 
    BEFORE UPDATE ON public.hipaa_risk_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_associate_agreements_updated_at 
    BEFORE UPDATE ON public.business_associate_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();