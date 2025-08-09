-- Secure PHI base table: medical_records (idempotent)
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Patients can view their own medical records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medical_records' AND policyname = 'Patients can view their own medical_records'
  ) THEN
    CREATE POLICY "Patients can view their own medical_records"
    ON public.medical_records
    FOR SELECT
    USING (
      patient_id IN (
        SELECT p.id FROM public.patients p
        WHERE p.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Providers can view medical records they created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medical_records' AND policyname = 'Providers can view their medical_records'
  ) THEN
    CREATE POLICY "Providers can view their medical_records"
    ON public.medical_records
    FOR SELECT
    USING (provider_id = auth.uid());
  END IF;
END $$;

-- Providers can insert medical records they create
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medical_records' AND policyname = 'Providers can insert medical_records'
  ) THEN
    CREATE POLICY "Providers can insert medical_records"
    ON public.medical_records
    FOR INSERT
    WITH CHECK (provider_id = auth.uid());
  END IF;
END $$;

-- Providers can update their own medical records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medical_records' AND policyname = 'Providers can update their medical_records'
  ) THEN
    CREATE POLICY "Providers can update their medical_records"
    ON public.medical_records
    FOR UPDATE
    USING (provider_id = auth.uid());
  END IF;
END $$;

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