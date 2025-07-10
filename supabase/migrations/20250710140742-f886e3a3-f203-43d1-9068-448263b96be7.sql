-- Ensure Row-Level Security is enabled on sharing_permissions
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;

-- Add policy for patients to view their access requests if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sharing_permissions' 
        AND policyname = 'Patients can view their access requests'
    ) THEN
        CREATE POLICY "Patients can view their access requests"
        ON sharing_permissions
        FOR SELECT
        USING (auth.uid() = patient_id);
    END IF;
END $$;