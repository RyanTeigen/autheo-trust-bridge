
-- First, let's completely drop all existing policies on the patients table
DROP POLICY IF EXISTS "Users can view own patient record" ON patients;
DROP POLICY IF EXISTS "Users can insert own patient record" ON patients;
DROP POLICY IF EXISTS "Users can update own patient record" ON patients;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON patients;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON patients;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON patients;

-- Disable RLS temporarily to clean up
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies that directly compare auth.uid() with user_id
CREATE POLICY "patients_select_policy" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "patients_insert_policy" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_update_policy" ON patients
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_delete_policy" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Also drop the problematic security definer function that might be causing issues
DROP FUNCTION IF EXISTS public.get_current_patient_id();
