-- Create prescription management tables for patient-provider medication workflow

-- Prescriptions table
CREATE TABLE public.prescriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    instructions TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
    refills_remaining INTEGER NOT NULL DEFAULT 0,
    total_refills INTEGER NOT NULL DEFAULT 0,
    prescribed_by TEXT NOT NULL,
    diagnosis_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medication adherence tracking
CREATE TABLE public.medication_adherence (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'delayed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescription refill requests
CREATE TABLE public.prescription_refill_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'fulfilled')),
    request_reason TEXT,
    provider_response TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescription communication
CREATE TABLE public.prescription_communications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('dosage_adjustment', 'side_effect_report', 'refill_reminder', 'general_inquiry')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'provider')),
    read_at TIMESTAMP WITH TIME ZONE,
    response_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_refill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_communications ENABLE ROW LEVEL SECURITY;

-- Prescriptions RLS policies
CREATE POLICY "Patients can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view prescriptions for their patients" 
ON public.prescriptions 
FOR SELECT 
USING (provider_id = auth.uid());

CREATE POLICY "Providers can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their prescriptions" 
ON public.prescriptions 
FOR UPDATE 
USING (provider_id = auth.uid());

-- Medication adherence RLS policies  
CREATE POLICY "Patients can manage their adherence records" 
ON public.medication_adherence 
FOR ALL 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view adherence for their patients" 
ON public.medication_adherence 
FOR SELECT 
USING (medication_id IN (SELECT id FROM prescriptions WHERE provider_id = auth.uid()));

-- Refill requests RLS policies
CREATE POLICY "Patients can create refill requests" 
ON public.prescription_refill_requests 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view their refill requests" 
ON public.prescription_refill_requests 
FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can manage refill requests" 
ON public.prescription_refill_requests 
FOR ALL 
USING (provider_id = auth.uid());

-- Prescription communications RLS policies
CREATE POLICY "Patients can manage communications about their prescriptions" 
ON public.prescription_communications 
FOR ALL 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can manage communications for their prescriptions" 
ON public.prescription_communications 
FOR ALL 
USING (provider_id = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.prescriptions 
ADD CONSTRAINT fk_prescriptions_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.medication_adherence 
ADD CONSTRAINT fk_medication_adherence_prescription 
FOREIGN KEY (medication_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;

ALTER TABLE public.medication_adherence 
ADD CONSTRAINT fk_medication_adherence_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.prescription_refill_requests 
ADD CONSTRAINT fk_refill_requests_prescription 
FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;

ALTER TABLE public.prescription_refill_requests 
ADD CONSTRAINT fk_refill_requests_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.prescription_communications 
ADD CONSTRAINT fk_prescription_communications_prescription 
FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;

ALTER TABLE public.prescription_communications 
ADD CONSTRAINT fk_prescription_communications_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_provider_id ON public.prescriptions(provider_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_medication_adherence_medication_id ON public.medication_adherence(medication_id);
CREATE INDEX idx_medication_adherence_patient_id ON public.medication_adherence(patient_id);
CREATE INDEX idx_refill_requests_prescription_id ON public.prescription_refill_requests(prescription_id);
CREATE INDEX idx_refill_requests_status ON public.prescription_refill_requests(status);
CREATE INDEX idx_prescription_communications_prescription_id ON public.prescription_communications(prescription_id);

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_prescription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_prescription_updated_at();

CREATE TRIGGER update_refill_requests_updated_at
    BEFORE UPDATE ON public.prescription_refill_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_prescription_updated_at();