-- Create incident reports table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for incident reports
CREATE POLICY "Users can insert their own incident reports" 
ON public.incident_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own incident reports" 
ON public.incident_reports 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins and compliance officers can view all incident reports
CREATE POLICY "Admins and compliance can view all incident reports" 
ON public.incident_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin'::user_role, 'compliance'::user_role])
));