-- Fix the get_patient_records function to match actual database schema
DROP FUNCTION IF EXISTS public.get_patient_records(uuid);

CREATE OR REPLACE FUNCTION public.get_patient_records(current_user_id uuid)
RETURNS TABLE (
  id uuid,
  patient_id uuid,
  record_type text,
  encrypted_data text,
  iv text,
  created_at timestamptz,
  record_hash text,
  anchored_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.patient_id,
    r.record_type,
    r.encrypted_data,
    r.iv,
    r.created_at,
    r.record_hash,
    r.anchored_at
  FROM medical_records r
  INNER JOIN sharing_permissions p
    ON r.id = p.medical_record_id
  WHERE p.grantee_id = current_user_id
    AND p.status = 'approved'
    AND (p.expires_at IS NULL OR p.expires_at > now());
END;
$$;