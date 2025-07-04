-- Add signed_consent column to sharing_permissions table
ALTER TABLE sharing_permissions ADD COLUMN signed_consent TEXT;