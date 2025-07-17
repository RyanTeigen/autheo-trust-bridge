-- Add foreign key constraint between sharing_permissions.grantee_id and profiles.id
ALTER TABLE sharing_permissions 
ADD CONSTRAINT sharing_permissions_grantee_id_fkey 
FOREIGN KEY (grantee_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also add foreign key for patient_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sharing_permissions_patient_id_fkey'
        AND table_name = 'sharing_permissions'
    ) THEN
        ALTER TABLE sharing_permissions 
        ADD CONSTRAINT sharing_permissions_patient_id_fkey 
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
    END IF;
END $$;