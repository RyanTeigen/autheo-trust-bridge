
-- First, let's make sure the profiles table has the proper foreign key relationship
-- and that our atomic_data_points table is properly configured

-- Check if we need to update the foreign key constraint for atomic_data_points
-- Remove existing constraint if it's incorrectly referencing profiles
DO $$
BEGIN
    -- Check if there's an existing foreign key constraint that might be problematic
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%atomic_data_points%owner_id%'
        AND table_name = 'atomic_data_points'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- We'll handle this case by case if needed
        RAISE NOTICE 'Foreign key constraint exists for owner_id';
    END IF;
    
    -- Ensure the owner_id column is properly set up to reference auth.users via profiles
    -- Since profiles.id should reference auth.users(id), this should work
END $$;

-- Make sure we have a proper index for the record_id column as well
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_record_id ON atomic_data_points(record_id);

-- Verify the table structure is correct
-- Add any missing columns if needed
DO $$
BEGIN
    -- Check if unit column exists, add if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atomic_data_points' 
        AND column_name = 'unit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE atomic_data_points ADD COLUMN unit text;
    END IF;
    
    -- Check if metadata column exists, add if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atomic_data_points' 
        AND column_name = 'metadata'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE atomic_data_points ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
    
    -- Check if updated_at column exists, add if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atomic_data_points' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE atomic_data_points ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;
