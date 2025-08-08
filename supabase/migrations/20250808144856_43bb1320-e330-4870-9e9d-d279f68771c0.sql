-- Secure PHI base table: medical_records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Patients can view their own medical records
CREATE POLICY IF NOT EXISTS "Patients can view their own medical_records"
ON public.medical_records
FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    WHERE p.user_id = auth.uid()
  )
);

-- Providers can view medical records they created
CREATE POLICY IF NOT EXISTS "Providers can view their medical_records"
ON public.medical_records
FOR SELECT
USING (provider_id = auth.uid());

-- Providers can insert medical records they create
CREATE POLICY IF NOT EXISTS "Providers can insert medical_records"
ON public.medical_records
FOR INSERT
WITH CHECK (provider_id = auth.uid());

-- Providers can update their own medical records
CREATE POLICY IF NOT EXISTS "Providers can update their medical_records"
ON public.medical_records
FOR UPDATE
USING (provider_id = auth.uid());

-- Ensure updated_at auto-updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_medical_records_updated_at'
  ) THEN
    CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_medical_records_updated_at();
  END IF;
END $$;