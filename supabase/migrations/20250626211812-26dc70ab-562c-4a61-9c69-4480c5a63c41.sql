
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own patient data" ON patients;
DROP POLICY IF EXISTS "Users can insert own patient data" ON patients;
DROP POLICY IF EXISTS "Users can update own patient data" ON patients;

-- Create new policies that don't cause recursion
CREATE POLICY "Enable read access for users based on user_id" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON patients
    FOR UPDATE USING (auth.uid() = user_id);
