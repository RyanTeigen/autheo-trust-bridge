
-- Add status and timestamp columns to sharing_permissions table
ALTER TABLE sharing_permissions
ADD COLUMN status text NOT NULL DEFAULT 'pending';

ALTER TABLE sharing_permissions
ADD COLUMN responded_at timestamp with time zone;

-- Add updated_at column (created_at already exists in the table)
ALTER TABLE sharing_permissions
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_sharing_permissions_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sharing_permissions_updated_at
    BEFORE UPDATE ON sharing_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_sharing_permissions_updated_at();
