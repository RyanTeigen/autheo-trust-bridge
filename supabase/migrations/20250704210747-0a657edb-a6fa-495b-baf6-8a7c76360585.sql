-- Add provider_id to medical_records table for provider-created records
ALTER TABLE public.medical_records 
ADD COLUMN provider_id uuid REFERENCES auth.users(id);

-- Add index for better performance on provider queries
CREATE INDEX idx_medical_records_provider_id ON public.medical_records(provider_id);

-- Create view for clinical records (provider-created) vs patient records (patient-created)
CREATE OR REPLACE VIEW public.clinical_records AS 
SELECT 
    id,
    patient_id,
    provider_id,
    user_id,
    record_type,
    encrypted_data,
    iv,
    record_hash,
    anchored_at,
    created_at,
    updated_at,
    'clinical' as record_source
FROM public.medical_records 
WHERE provider_id IS NOT NULL;

CREATE OR REPLACE VIEW public.patient_records AS 
SELECT 
    id,
    patient_id,
    provider_id,
    user_id,
    record_type,
    encrypted_data,
    iv,
    record_hash,
    anchored_at,
    created_at,
    updated_at,
    'patient' as record_source
FROM public.medical_records 
WHERE provider_id IS NULL AND user_id IS NOT NULL;

-- Update RLS policies to allow providers to create clinical records
CREATE POLICY "Providers can create clinical records for patients" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'provider'
    ) 
    AND provider_id = auth.uid()
);

-- Allow providers to view clinical records they created
CREATE POLICY "Providers can view their own clinical records" 
ON public.medical_records 
FOR SELECT 
USING (provider_id = auth.uid());

-- Allow patients to view clinical records created for them (if shared)
CREATE POLICY "Patients can view clinical records shared with them" 
ON public.medical_records 
FOR SELECT 
USING (
    patient_id IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM public.patients 
        WHERE id = medical_records.patient_id 
        AND user_id = auth.uid()
    )
);