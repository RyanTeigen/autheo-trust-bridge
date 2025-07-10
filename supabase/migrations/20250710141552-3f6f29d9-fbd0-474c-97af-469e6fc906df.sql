-- Add status column to sharing_permissions table
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_status 
ON sharing_permissions(status);

-- Add responded_at timestamp column for tracking when decisions were made
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS responded_at timestamp with time zone;

-- Add decision_note column for optional notes when approving/denying
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS decision_note text;

-- Update RLS policies to allow providers to view approved permissions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sharing_permissions' 
        AND policyname = 'Providers can view approved sharing permissions'
    ) THEN
        CREATE POLICY "Providers can view approved sharing permissions"
        ON sharing_permissions
        FOR SELECT
        USING (grantee_id = auth.uid() AND status = 'approved');
    END IF;
END $$;