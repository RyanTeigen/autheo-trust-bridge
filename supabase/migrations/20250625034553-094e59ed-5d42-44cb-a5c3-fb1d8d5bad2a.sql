
-- Check and create only missing RLS policies for record_shares table

-- First, let's enable RLS if it's not already enabled
ALTER TABLE public.record_shares ENABLE ROW LEVEL SECURITY;

-- Create policies that may be missing (using IF NOT EXISTS where possible)

-- Policy: Record owners can create shares for their records
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'record_shares' 
        AND policyname = 'Record owners can create shares'
    ) THEN
        CREATE POLICY "Record owners can create shares" 
          ON public.record_shares 
          FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.medical_records mr 
              JOIN public.patients p ON mr.patient_id = p.id 
              WHERE mr.id = record_shares.record_id 
              AND p.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Policy: Record owners can update shares for their records
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'record_shares' 
        AND policyname = 'Record owners can update shares'
    ) THEN
        CREATE POLICY "Record owners can update shares" 
          ON public.record_shares 
          FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM public.medical_records mr 
              JOIN public.patients p ON mr.patient_id = p.id 
              WHERE mr.id = record_shares.record_id 
              AND p.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Policy: Record owners can delete shares for their records
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'record_shares' 
        AND policyname = 'Record owners can delete shares'
    ) THEN
        CREATE POLICY "Record owners can delete shares" 
          ON public.record_shares 
          FOR DELETE 
          USING (
            EXISTS (
              SELECT 1 FROM public.medical_records mr 
              JOIN public.patients p ON mr.patient_id = p.id 
              WHERE mr.id = record_shares.record_id 
              AND p.user_id = auth.uid()
            )
          );
    END IF;
END $$;
