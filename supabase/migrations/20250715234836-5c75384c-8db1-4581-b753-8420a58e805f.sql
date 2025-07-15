-- Add status and assigned_to columns to incident_reports table
ALTER TABLE incident_reports
ADD COLUMN status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved'));

ALTER TABLE incident_reports
ADD COLUMN assigned_to UUID REFERENCES auth.users(id);

-- Update RLS policies for compliance officers to manage status and assignment
CREATE POLICY "Compliance officers can update incident reports" 
ON incident_reports 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'compliance'::user_role
));