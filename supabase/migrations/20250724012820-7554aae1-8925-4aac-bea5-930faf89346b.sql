-- Fix remaining functions with search path issues
CREATE OR REPLACE FUNCTION public.create_access_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Insert notification for the patient
  INSERT INTO patient_notifications (
    patient_id,
    notification_type,
    title,
    message,
    priority,
    data,
    created_at
  ) VALUES (
    NEW.patient_id,
    'access_request',
    '🏥 New Access Request',
    'A healthcare provider is requesting access to your medical records. Please review and respond.',
    CASE 
      WHEN NEW.urgency_level = 'urgent' THEN 'urgent'
      WHEN NEW.urgency_level = 'high' THEN 'high'
      ELSE 'normal'
    END,
    jsonb_build_object(
      'request_id', NEW.id,
      'grantee_id', NEW.grantee_id,
      'medical_record_id', NEW.medical_record_id,
      'permission_type', NEW.permission_type,
      'urgency_level', NEW.urgency_level,
      'clinical_justification', NEW.clinical_justification
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_access_approved_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only create notification if status changed to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Insert notification for the grantee (provider)
    INSERT INTO patient_notifications (
      patient_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.grantee_id,
      'access_granted',
      '✅ Access Request Approved',
      'Your access request for patient records has been approved. You can now view the shared medical records.',
      'normal',
      jsonb_build_object(
        'permission_id', NEW.id,
        'patient_id', NEW.patient_id,
        'medical_record_id', NEW.medical_record_id,
        'permission_type', NEW.permission_type,
        'granted_at', NEW.updated_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.call_hash_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Log that a record was created/updated
  RAISE NOTICE 'Medical record % was %: patient_id=%, provider_id=%', 
    NEW.id, lower(TG_OP), NEW.patient_id, NEW.provider_id;
  
  -- TODO: Add HTTP call to hash-record function once pg_net is enabled
  -- For now, this serves as a placeholder that logs operations
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_access_logs_by_patient(current_patient_id uuid)
 RETURNS TABLE(id uuid, provider_id uuid, action text, record_id uuid, log_timestamp timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.provider_id,
    l.action,
    l.record_id,
    l.log_timestamp
  FROM access_logs l
  WHERE l.patient_id = current_patient_id
  ORDER BY l.log_timestamp DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.provider_submit_record(provider_id_param uuid, patient_id_param uuid, record_type_param text, encrypted_data_param text, iv_param text)
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

CREATE OR REPLACE FUNCTION public.update_appointment_access_mappings()
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

CREATE OR REPLACE FUNCTION public.detect_potential_breaches()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    recent_access_count INTEGER;
    user_role TEXT;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM profiles WHERE id = NEW.user_id;
    
    -- Check for excessive access patterns
    SELECT COUNT(*) INTO recent_access_count
    FROM audit_logs
    WHERE user_id = NEW.user_id
    AND timestamp > NOW() - INTERVAL '1 hour'
    AND action LIKE '%ACCESS%';
    
    -- If more than 50 accesses in an hour, flag as potential breach
    IF recent_access_count > 50 THEN
        INSERT INTO breach_detection_events (
            user_id,
            event_type,
            severity,
            description,
            metadata
        ) VALUES (
            NEW.user_id,
            'excessive_access',
            'high',
            'User accessed resources ' || recent_access_count || ' times in the last hour',
            jsonb_build_object('access_count', recent_access_count, 'user_role', user_role)
        );
    END IF;
    
    -- Check for unauthorized PHI access
    IF NEW.phi_accessed = TRUE AND user_role NOT IN ('provider', 'compliance', 'admin') THEN
        INSERT INTO breach_detection_events (
            user_id,
            event_type,
            severity,
            description,
            metadata
        ) VALUES (
            NEW.user_id,
            'unauthorized_phi_access',
            'critical',
            'User with role ' || user_role || ' accessed PHI without proper authorization',
            jsonb_build_object('resource', NEW.resource, 'user_role', user_role)
        );
    END IF;
    
    RETURN NEW;
END;
$function$;