-- Drop existing function and create updated version
DROP FUNCTION IF EXISTS public.get_patient_records(uuid);

-- Create function to get patient records shared with current user
-- Updated to match the actual database schema
CREATE OR REPLACE FUNCTION public.get_patient_records(current_user_id uuid)
RETURNS TABLE (
  id uuid,
  patient_id uuid,
  provider_id uuid,
  record_type text,
  encrypted_data text,
  iv text,
  created_at timestamptz,
  record_hash text
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.patient_id,
    r.provider_id,
    r.record_type,
    r.encrypted_data,
    r.iv,
    r.created_at,
    r.record_hash
  FROM medical_records r
  INNER JOIN sharing_permissions p
    ON r.id = p.medical_record_id
  WHERE p.grantee_id = current_user_id
    AND p.status = 'approved'
    AND (p.expires_at IS NULL OR p.expires_at > NOW());
END;
$$;