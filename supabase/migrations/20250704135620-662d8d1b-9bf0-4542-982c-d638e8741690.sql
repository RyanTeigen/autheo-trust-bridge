-- Fix infinite recursion in patients table RLS policies
-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Patients and providers can view records" ON public.patients;
DROP POLICY IF EXISTS "providers_can_view_patients" ON public.patients;

-- Create a simple, non-recursive policy for patients to view their own records
CREATE POLICY "Patients can view their own records" 
ON public.patients 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a simple policy for providers to view patients (without recursion)
CREATE POLICY "Providers can view all patients" 
ON public.patients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'provider'
  )
);

-- Ensure admins can view all patients
CREATE POLICY "Admins can view all patients" 
ON public.patients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);