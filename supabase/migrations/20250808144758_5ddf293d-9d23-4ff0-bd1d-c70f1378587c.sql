-- Enable RLS and add policies for clinical_records (PHI)
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

-- Patients can view their own clinical records (via patients.user_id mapping)
CREATE POLICY "Patients can view their own clinical_records"
ON public.clinical_records
FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    WHERE p.user_id = auth.uid()
  )
);

-- Providers can view clinical records they created
CREATE POLICY "Providers can view their clinical_records"
ON public.clinical_records
FOR SELECT
USING (provider_id = auth.uid());

-- Providers can insert clinical records they create
CREATE POLICY "Providers can insert clinical_records"
ON public.clinical_records
FOR INSERT
WITH CHECK (provider_id = auth.uid());

-- Providers can update their own clinical records
CREATE POLICY "Providers can update their clinical_records"
ON public.clinical_records
FOR UPDATE
USING (provider_id = auth.uid());

-- Auto-update updated_at on UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_clinical_records_updated_at'
  ) THEN
    CREATE TRIGGER update_clinical_records_updated_at
    BEFORE UPDATE ON public.clinical_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;