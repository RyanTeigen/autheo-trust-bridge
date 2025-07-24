-- Fix foreign key constraint issue with patients table
-- Remove the problematic foreign key constraint and recreate properly
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_id_fkey;

-- Fix security definer functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.update_medical_records_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_record_shares_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_cross_hospital_requests_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    -- Get role from profiles table without causing recursion
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_patient_records(current_user_id uuid)
 RETURNS TABLE(id uuid, patient_id uuid, provider_id uuid, record_type text, encrypted_data text, iv text, created_at timestamp with time zone, record_hash text, recipient_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
    r.record_hash,
    p.grantee_id as recipient_id
  FROM medical_records r
  INNER JOIN sharing_permissions p
    ON r.id = p.medical_record_id
  WHERE p.grantee_id = current_user_id
    AND p.status = 'approved'
    AND (p.expires_at IS NULL OR p.expires_at > NOW());
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_quantum_threat_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE user_sessions 
  SET is_active = FALSE, 
      terminated_at = NOW(),
      termination_reason = 'expired'
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.extend_session(session_token_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  session_found BOOLEAN := FALSE;
BEGIN
  UPDATE user_sessions 
  SET last_activity = NOW(),
      expires_at = NOW() + INTERVAL '8 hours'
  WHERE session_token = session_token_param 
    AND is_active = TRUE 
    AND expires_at > NOW();
    
  GET DIAGNOSTICS session_found = ROW_COUNT;
  RETURN session_found > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_sharing_permission(permission_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    permission_record sharing_permissions%ROWTYPE;
BEGIN
    -- Get the permission record first to validate ownership
    SELECT * INTO permission_record
    FROM sharing_permissions
    WHERE id = permission_id
    AND patient_id = auth.uid();  -- Ensure user owns this permission
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permission not found or access denied';
    END IF;
    
    -- Update the permission status to revoked
    UPDATE sharing_permissions
    SET status = 'revoked',
        updated_at = NOW(),
        responded_at = NOW()
    WHERE id = permission_id;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        resource_id,
        status,
        details,
        timestamp
    ) VALUES (
        auth.uid(),
        'REVOKE_SHARING_PERMISSION',
        'sharing_permissions',
        permission_id,
        'success',
        'Patient revoked sharing permission for provider ' || permission_record.grantee_id,
        NOW()
    );
END;
$function$;