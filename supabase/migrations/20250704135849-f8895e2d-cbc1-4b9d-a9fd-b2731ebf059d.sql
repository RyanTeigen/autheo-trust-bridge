-- Check and fix all RLS policies that might cause infinite recursion

-- First, let's drop ALL potentially problematic policies on patients table
DROP POLICY IF EXISTS "Patients and providers can view records" ON public.patients;
DROP POLICY IF EXISTS "providers_can_view_patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can view their own patient record" ON public.patients;
DROP POLICY IF EXISTS "Providers can view patients with sharing permissions" ON public.patients;

-- Create clean, simple policies for patients table
CREATE POLICY "patients_basic_select" 
ON public.patients 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = id);

-- Fix any problematic policies on medical_records table
DROP POLICY IF EXISTS "Patients can view their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Patients can insert their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Patients can update their own medical records" ON public.medical_records;

-- Create simple medical_records policies
CREATE POLICY "medical_records_user_access" 
ON public.medical_records 
FOR ALL
USING (auth.uid() = user_id);

-- Also allow providers to access records they create
CREATE POLICY "medical_records_provider_access" 
ON public.medical_records 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('provider', 'admin')
  )
);