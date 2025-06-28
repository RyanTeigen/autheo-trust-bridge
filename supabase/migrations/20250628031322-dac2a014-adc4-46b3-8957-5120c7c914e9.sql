
-- Fix the infinite recursion issue in patients table RLS policies
-- The current policies are causing recursion because they reference the same table

-- First, let's create a security definer function to safely get the current user's patient ID
CREATE OR REPLACE FUNCTION public.get_current_patient_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    patient_uuid uuid;
BEGIN
    SELECT id INTO patient_uuid
    FROM public.patients
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN patient_uuid;
END;
$$;

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON patients;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON patients; 
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON patients;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view own patient record" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patient record" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patient record" ON patients
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS on patients table if not already enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Also add the sharing_permissions columns if they don't exist
-- (This handles the case where the migration hasn't been run yet)
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sharing_permissions' AND column_name = 'status') THEN
        ALTER TABLE sharing_permissions ADD COLUMN status text NOT NULL DEFAULT 'pending';
    END IF;
    
    -- Add responded_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sharing_permissions' AND column_name = 'responded_at') THEN
        ALTER TABLE sharing_permissions ADD COLUMN responded_at timestamp with time zone;
    END IF;
    
    -- Add updated_at column if it doesn't exist (created_at should already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sharing_permissions' AND column_name = 'updated_at') THEN
        ALTER TABLE sharing_permissions ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END
$$;
