-- Fix security definer functions missing search_path settings
-- This prevents potential privilege escalation attacks

-- 1. Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- 2. Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- 3. Fix has_role function (if it exists, create it with proper security)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = _user_id AND role::text = _role
    );
END;
$function$;

-- 4. Fix cleanup_expired_sessions function
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

-- 5. Fix extend_session function
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

-- 6. Fix revoke_sharing_permission function
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
    AND patient_id = auth.uid();
    
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

-- 7. Fix provider_submit_record function
CREATE OR REPLACE FUNCTION public.provider_submit_record(
    provider_id_param uuid, 
    patient_id_param uuid, 
    record_type_param text, 
    encrypted_data_param text, 
    iv_param text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_record_id uuid;
  record_hash text;
  hash_input text;
BEGIN
  -- Step 1: Insert the encrypted medical record
  INSERT INTO medical_records (
    provider_id, 
    patient_id, 
    record_type, 
    encrypted_data, 
    iv,
    user_id
  )
  VALUES (
    provider_id_param, 
    patient_id_param, 
    record_type_param, 
    encrypted_data_param, 
    iv_param,
    provider_id_param
  )
  RETURNING id INTO new_record_id;

  -- Step 2: Generate hash for the record
  hash_input := new_record_id::text || encrypted_data_param || record_type_param || EXTRACT(EPOCH FROM NOW())::text;
  record_hash := encode(digest(hash_input, 'sha256'), 'hex');

  -- Step 3: Queue the record hash for blockchain anchoring
  INSERT INTO hash_anchor_queue (
    record_type, 
    record_id, 
    hash, 
    patient_id, 
    provider_id
  )
  VALUES (
    'medical_record', 
    new_record_id, 
    record_hash, 
    patient_id_param, 
    provider_id_param
  );

  -- Step 4: Insert audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    status,
    details
  ) VALUES (
    provider_id_param,
    'CREATE_MEDICAL_RECORD',
    'medical_records',
    new_record_id,
    'success',
    'Provider created medical record for patient'
  );

  RETURN new_record_id;
END;
$function$;