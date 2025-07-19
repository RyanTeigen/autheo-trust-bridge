-- Update get_provider_visible_records function to include cross-hospital approved records
CREATE OR REPLACE FUNCTION public.get_provider_visible_records(current_user_id uuid)
RETURNS TABLE(
  id uuid, 
  patient_id uuid, 
  record_type text, 
  encrypted_data text, 
  created_at timestamp with time zone, 
  permission_type text, 
  patient_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Regular sharing permissions
  SELECT
    mr.id,
    mr.patient_id,
    mr.record_type,
    mr.encrypted_data,
    mr.created_at,
    sp.permission_type,
    COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name)) as patient_name
  FROM medical_records mr
  INNER JOIN sharing_permissions sp ON mr.id = sp.medical_record_id
  LEFT JOIN patients p ON mr.patient_id = p.id
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE sp.grantee_id = current_user_id
    AND sp.status = 'approved'
    AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
  
  UNION ALL
  
  -- Cross-hospital approved records
  SELECT
    mr.id,
    mr.patient_id,
    mr.record_type,
    mr.encrypted_data,
    mr.created_at,
    chr.permission_type,
    COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name)) as patient_name
  FROM medical_records mr
  INNER JOIN cross_hospital_requests chr ON mr.patient_id = chr.patient_id
  LEFT JOIN patients p ON mr.patient_id = p.id
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE chr.provider_id = current_user_id
    AND chr.status = 'approved'
    AND (chr.expires_at IS NULL OR chr.expires_at > NOW())
  
  ORDER BY created_at DESC;
END;
$$;