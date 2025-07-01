
-- Create function to get patient records that are not revoked
CREATE OR REPLACE FUNCTION public.get_patient_records(current_user_id uuid)
RETURNS TABLE (
  id uuid,
  patient_id uuid,
  record_type text,
  encrypted_data text,
  iv text,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.patient_id,
    mr.record_type,
    mr.encrypted_data,
    mr.iv,
    mr.created_at,
    mr.updated_at
  FROM medical_records mr
  WHERE mr.patient_id IN (
    SELECT p.id 
    FROM patients p 
    WHERE p.user_id = current_user_id
  )
  AND mr.id NOT IN (
    SELECT rs.record_id 
    FROM revoked_shares rs 
    WHERE rs.revoked_by = current_user_id
  );
END;
$$;
