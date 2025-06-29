
-- First, drop all existing problematic policies on patients table
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;
DROP POLICY IF EXISTS "Users can view their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can create their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON patients;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON patients;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON patients;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON patients;

-- Temporarily disable RLS to clean up
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies that directly use auth.uid()
CREATE POLICY "patients_can_view_own" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "patients_can_insert_own" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_can_update_own" ON patients
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_can_delete_own" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Also create a policy for providers to access patient records they have permission for
-- This uses a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    -- Get role from profiles table without causing recursion
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add policy for providers to access patient data
CREATE POLICY "providers_can_view_patients" ON patients
    FOR SELECT USING (
        public.get_user_role() = 'provider' OR 
        public.get_user_role() = 'admin'
    );
