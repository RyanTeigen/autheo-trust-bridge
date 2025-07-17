-- Create hospital registry table
CREATE TABLE public.hospital_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id TEXT NOT NULL UNIQUE,
  hospital_name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  certification_data JSONB DEFAULT '{}',
  api_endpoint TEXT,
  public_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cross-hospital access requests table
CREATE TABLE public.cross_hospital_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  requesting_hospital_id TEXT NOT NULL,
  receiving_hospital_id TEXT NOT NULL,
  provider_id UUID NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'cross_hospital',
  urgency_level TEXT NOT NULL DEFAULT 'normal',
  clinical_justification TEXT NOT NULL,
  permission_type TEXT NOT NULL DEFAULT 'read',
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  patient_consent_given BOOLEAN DEFAULT false,
  patient_consent_at TIMESTAMP WITH TIME ZONE,
  inter_hospital_approved BOOLEAN DEFAULT false,
  inter_hospital_approved_at TIMESTAMP WITH TIME ZONE,
  data_shared_at TIMESTAMP WITH TIME ZONE,
  audit_trail JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  FOREIGN KEY (requesting_hospital_id) REFERENCES hospital_registry(hospital_id),
  FOREIGN KEY (receiving_hospital_id) REFERENCES hospital_registry(hospital_id)
);

-- Enable RLS on new tables
ALTER TABLE public.hospital_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_hospital_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hospital_registry
CREATE POLICY "Verified hospitals are publicly visible" 
ON public.hospital_registry 
FOR SELECT 
USING (verification_status = 'verified');

CREATE POLICY "Admins can manage hospital registry" 
ON public.hospital_registry 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create RLS policies for cross_hospital_requests
CREATE POLICY "Patients can view their own cross-hospital requests" 
ON public.cross_hospital_requests 
FOR SELECT 
USING (patient_id = auth.uid() OR patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

CREATE POLICY "Providers can view requests they initiated" 
ON public.cross_hospital_requests 
FOR SELECT 
USING (provider_id = auth.uid());

CREATE POLICY "Providers can create cross-hospital requests" 
ON public.cross_hospital_requests 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Patients can update consent for their requests" 
ON public.cross_hospital_requests 
FOR UPDATE 
USING (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
))
WITH CHECK (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_cross_hospital_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cross_hospital_requests_updated_at
  BEFORE UPDATE ON public.cross_hospital_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cross_hospital_requests_updated_at();

-- Insert some sample verified hospitals
INSERT INTO public.hospital_registry (hospital_id, hospital_name, address, contact_email, verification_status, verified_at) VALUES
('ST-MARY-001', 'St. Mary Medical Center', '123 Healthcare Ave, Medical City, MC 12345', 'contact@stmary.health', 'verified', NOW()),
('GENERAL-002', 'General Hospital Network', '456 Hospital Blvd, Health District, HD 67890', 'info@generalhealth.org', 'verified', NOW()),
('CHILDRENS-003', 'Children''s Medical Center', '789 Kids Lane, Family City, FC 13579', 'contact@childrensmc.health', 'verified', NOW()),
('REGIONAL-004', 'Regional Medical Institute', '321 Regional Pkwy, Metro Area, MA 24680', 'admin@regionalmed.net', 'verified', NOW());