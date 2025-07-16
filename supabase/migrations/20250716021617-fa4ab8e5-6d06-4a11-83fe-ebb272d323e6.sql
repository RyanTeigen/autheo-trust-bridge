-- Create access_logs table for tracking patient record access
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id), 
  record_id UUID REFERENCES medical_records(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Patients can view their own access logs
CREATE POLICY "Patients can view their own access logs"
ON public.access_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM patients 
  WHERE patients.id = access_logs.patient_id 
  AND patients.user_id = auth.uid()
));

-- Providers can view access logs for records they created
CREATE POLICY "Providers can view access logs for their records"
ON public.access_logs  
FOR SELECT
USING (provider_id = auth.uid());

-- System can insert access logs
CREATE POLICY "System can insert access logs"
ON public.access_logs
FOR INSERT
WITH CHECK (true);

-- Create the function to get access logs by patient
CREATE OR REPLACE FUNCTION get_access_logs_by_patient(current_patient_id UUID)
RETURNS TABLE (
  id UUID,
  provider_id UUID,
  action TEXT,
  record_id UUID,
  timestamp TIMESTAMPTZ
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.provider_id,
    l.action,
    l.record_id,
    l.timestamp
  FROM access_logs l
  WHERE l.patient_id = current_patient_id
  ORDER BY l.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;