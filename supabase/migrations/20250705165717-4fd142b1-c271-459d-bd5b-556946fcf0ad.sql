-- Add status column if not already present (should already exist but let's ensure it)
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'));

-- Add optional note field for tracking decisions
ALTER TABLE sharing_permissions
ADD COLUMN IF NOT EXISTS decision_note text;

-- Add responded_at timestamp if not present
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS responded_at timestamptz;