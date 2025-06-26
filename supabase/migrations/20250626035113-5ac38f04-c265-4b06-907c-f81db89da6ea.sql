
-- Drop existing problematic policies on patients table if they exist
DROP POLICY IF EXISTS "Users can view their own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can create their own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON public.patients;

-- Create proper RLS policies for patients table
CREATE POLICY "Users can view their own patient record" 
  ON public.patients 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own patient record" 
  ON public.patients 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patient record" 
  ON public.patients 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Also ensure medical_records table has proper RLS policies
DROP POLICY IF EXISTS "Users can view their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can create their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update their own medical records" ON public.medical_records;

CREATE POLICY "Users can view their own medical records" 
  ON public.medical_records 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own medical records" 
  ON public.medical_records 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own medical records" 
  ON public.medical_records 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Enable RLS on both tables if not already enabled
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
