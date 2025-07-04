-- Replace the existing get_patient_records function with the new sharing permissions approach
-- Using 'recorded_at' instead of 'timestamp' to avoid reserved keyword conflict
DROP FUNCTION IF EXISTS public.get_patient_records(uuid);

CREATE OR REPLACE FUNCTION public.get_patient_records(current_user_id uuid)
RETURNS TABLE (
  id uuid,
  patient_id uuid,
  provider_id uuid,
  type text,
  value text,
  unit text,
  recorded_at timestamptz
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
    r.type,
    r.value,
    r.unit,
    r.created_at as recorded_at
  FROM medical_records r
  INNER JOIN sharing_permissions p
    ON r.patient_id = p.patient_id
   AND r.id = p.medical_record_id
  WHERE p.grantee_id = current_user_id
    AND p.status = 'approved';
END;
$$;