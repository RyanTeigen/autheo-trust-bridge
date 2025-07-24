-- Fix the final remaining functions with search path issues
CREATE OR REPLACE FUNCTION public.respond_to_appointment_access_request(appointment_id_param uuid, decision_param text, note_param text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  appointment_record enhanced_appointments%ROWTYPE;
  patient_record patients%ROWTYPE;
  access_duration INTEGER := 24;
  access_expiry TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  -- Validate decision parameter
  IF decision_param NOT IN ('approve', 'deny') THEN
    RAISE EXCEPTION 'Invalid decision. Must be "approve" or "deny"';
  END IF;

  -- Get appointment record
  SELECT * INTO appointment_record
  FROM enhanced_appointments
  WHERE id = appointment_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  -- Get patient record to verify ownership
  SELECT * INTO patient_record
  FROM patients
  WHERE id = appointment_record.patient_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: Not your appointment';
  END IF;

  -- Calculate access expiry
  access_expiry := appointment_record.appointment_date + (access_duration || ' hours')::INTERVAL;

  IF decision_param = 'approve' THEN
    -- Update appointment status
    UPDATE enhanced_appointments
    SET 
      access_request_status = 'approved',
      access_granted_at = NOW(),
      access_expires_at = access_expiry,
      updated_at = NOW()
    WHERE id = appointment_id_param;

    -- Create sharing permissions for all patient's medical records
    INSERT INTO sharing_permissions (
      patient_id,
      grantee_id,
      medical_record_id,
      permission_type,
      status,
      expires_at,
      created_at,
      updated_at
    )
    SELECT 
      appointment_record.patient_id,
      appointment_record.provider_id,
      mr.id,
      'read',
      'approved',
      access_expiry,
      NOW(),
      NOW()
    FROM medical_records mr 
    WHERE mr.patient_id = appointment_record.patient_id
    AND NOT EXISTS (
      SELECT 1 FROM sharing_permissions sp 
      WHERE sp.patient_id = appointment_record.patient_id 
      AND sp.grantee_id = appointment_record.provider_id 
      AND sp.medical_record_id = mr.id
      AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    );

    -- Update appointment access mapping
    UPDATE appointment_access_mappings
    SET 
      access_granted = true,
      updated_at = NOW()
    WHERE appointment_id = appointment_id_param;

    result := jsonb_build_object(
      'success', true,
      'message', 'Access request approved successfully',
      'access_expires_at', access_expiry
    );

  ELSE -- deny
    -- Update appointment status
    UPDATE enhanced_appointments
    SET 
      access_request_status = 'denied',
      updated_at = NOW()
    WHERE id = appointment_id_param;

    -- Update appointment access mapping
    UPDATE appointment_access_mappings
    SET 
      access_granted = false,
      updated_at = NOW()
    WHERE appointment_id = appointment_id_param;

    result := jsonb_build_object(
      'success', true,
      'message', 'Access request denied'
    );
  END IF;

  -- Insert audit trail
  INSERT INTO appointment_audit_trail (
    appointment_id,
    action,
    performed_by,
    details
  ) VALUES (
    appointment_id_param,
    UPPER(decision_param) || '_ACCESS_REQUEST',
    auth.uid(),
    jsonb_build_object(
      'decision', decision_param,
      'note', note_param,
      'processed_at', NOW(),
      'access_duration_hours', CASE WHEN decision_param = 'approve' THEN access_duration ELSE NULL END
    )
  );

  -- Mark related notifications as read
  UPDATE patient_notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE patient_id = appointment_record.patient_id
  AND notification_type IN ('appointment_access_request')
  AND (data->>'appointment_id')::uuid = appointment_id_param;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_appointment_details(appointment_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  appointment_record RECORD;
  provider_info RECORD;
  data_type_mapping RECORD;
  result jsonb;
BEGIN
  -- Get appointment with access mapping
  SELECT 
    ea.*,
    aam.access_granted,
    aam.access_duration_hours,
    aam.clinical_justification,
    aam.auto_granted
  INTO appointment_record
  FROM enhanced_appointments ea
  LEFT JOIN appointment_access_mappings aam ON ea.id = aam.appointment_id
  WHERE ea.id = appointment_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  -- Verify patient ownership
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = appointment_record.patient_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Not your appointment';
  END IF;

  -- Get provider information
  SELECT 
    COALESCE(full_name, CONCAT(first_name, ' ', last_name), email) as name,
    email,
    first_name,
    last_name
  INTO provider_info
  FROM profiles
  WHERE id = appointment_record.provider_id;

  -- Get data type mapping
  SELECT * INTO data_type_mapping
  FROM appointment_data_type_mappings
  WHERE appointment_type = appointment_record.appointment_type;

  -- Build result
  result := jsonb_build_object(
    'appointment', jsonb_build_object(
      'id', appointment_record.id,
      'appointment_type', appointment_record.appointment_type,
      'appointment_date', appointment_record.appointment_date,
      'status', appointment_record.status,
      'urgency_level', appointment_record.urgency_level,
      'clinical_notes', appointment_record.clinical_notes,
      'access_request_status', appointment_record.access_request_status,
      'access_granted_at', appointment_record.access_granted_at,
      'access_expires_at', appointment_record.access_expires_at
    ),
    'provider', jsonb_build_object(
      'id', appointment_record.provider_id,
      'name', COALESCE(provider_info.name, 'Unknown Provider'),
      'email', provider_info.email
    ),
    'access_info', jsonb_build_object(
      'access_granted', COALESCE(appointment_record.access_granted, false),
      'access_duration_hours', COALESCE(appointment_record.access_duration_hours, 24),
      'clinical_justification', appointment_record.clinical_justification,
      'auto_granted', COALESCE(appointment_record.auto_granted, false)
    ),
    'data_requirements', CASE 
      WHEN data_type_mapping.required_data_types IS NOT NULL THEN
        jsonb_build_object(
          'required_data_types', to_jsonb(data_type_mapping.required_data_types),
          'access_justification', data_type_mapping.access_justification,
          'priority_level', data_type_mapping.priority_level
        )
      ELSE
        jsonb_build_object(
          'required_data_types', '[]'::jsonb,
          'access_justification', null,
          'priority_level', 'normal'
        )
    END
  );

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_user_wallet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    -- Wrap in try-catch to prevent signup failures
    BEGIN
        INSERT INTO public.autheo_balances (user_id, balance)
        VALUES (NEW.id, 100); -- Start with 100 Autheo coins
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE NOTICE 'Error initializing wallet for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_provider_cross_hospital_decision()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  patient_name TEXT;
  hospital_name TEXT;
BEGIN
  -- Only create notification if status changed to approved or denied
  IF NEW.status IN ('approved', 'denied') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get hospital name
    SELECT hospital_name INTO hospital_name
    FROM hospital_registry
    WHERE hospital_id = NEW.requesting_hospital_id;
    
    -- Insert notification for the provider
    INSERT INTO provider_notifications (
      provider_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.provider_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'cross_hospital_approved'
        ELSE 'cross_hospital_denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN '✅ Cross-Hospital Access Approved'
        ELSE '❌ Cross-Hospital Access Denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 
          format('Patient %s has approved your cross-hospital access request. You can now access their medical records from %s.',
            COALESCE(patient_name, 'Unknown Patient'),
            COALESCE(hospital_name, 'the requesting hospital'))
        ELSE 
          format('Patient %s has denied your cross-hospital access request from %s.',
            COALESCE(patient_name, 'Unknown Patient'),
            COALESCE(hospital_name, 'the requesting hospital'))
      END,
      CASE 
        WHEN NEW.urgency_level = 'emergency' THEN 'urgent'
        WHEN NEW.urgency_level = 'urgent' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'request_id', NEW.id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'hospital_name', hospital_name,
        'status', NEW.status,
        'request_type', NEW.request_type,
        'urgency_level', NEW.urgency_level,
        'decision_date', NEW.updated_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_provider_notifications_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_wallet_address(user_id uuid, wallet text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE profiles
  SET wallet_address = wallet
  WHERE id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_cross_hospital_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  patient_name TEXT;
  provider_name TEXT;
  requesting_hospital_name TEXT;
  receiving_hospital_name TEXT;
BEGIN
  -- Get patient name
  SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
  INTO patient_name
  FROM patients p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE p.id = NEW.patient_id;
  
  -- Get provider name
  SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Unknown Provider')
  INTO provider_name
  FROM profiles
  WHERE id = NEW.provider_id;
  
  -- Get requesting hospital name
  SELECT hospital_name INTO requesting_hospital_name
  FROM hospital_registry
  WHERE hospital_id = NEW.requesting_hospital_id;
  
  -- Get receiving hospital name  
  SELECT hospital_name INTO receiving_hospital_name
  FROM hospital_registry
  WHERE hospital_id = NEW.receiving_hospital_id;
  
  -- Insert notification for the patient
  INSERT INTO patient_notifications (
    patient_id,
    notification_type,
    title,
    message,
    priority,
    data,
    created_at,
    expires_at
  ) VALUES (
    NEW.patient_id,
    'cross_hospital_request',
    '🏥 Cross-Hospital Access Request',
    format('Dr. %s from %s is requesting access to your medical records from %s for %s. Clinical justification: %s',
      COALESCE(provider_name, 'Unknown Provider'),
      COALESCE(requesting_hospital_name, 'Unknown Hospital'),
      COALESCE(receiving_hospital_name, 'Previous Hospital'),
      LOWER(NEW.request_type),
      COALESCE(NEW.clinical_justification, 'Medical care coordination')
    ),
    CASE 
      WHEN NEW.urgency_level = 'emergency' THEN 'urgent'
      WHEN NEW.urgency_level = 'urgent' THEN 'high'
      ELSE 'normal'
    END,
    jsonb_build_object(
      'request_id', NEW.id,
      'provider_id', NEW.provider_id,
      'provider_name', provider_name,
      'requesting_hospital_id', NEW.requesting_hospital_id,
      'requesting_hospital_name', requesting_hospital_name,
      'receiving_hospital_id', NEW.receiving_hospital_id,
      'receiving_hospital_name', receiving_hospital_name,
      'urgency_level', NEW.urgency_level,
      'clinical_justification', NEW.clinical_justification,
      'request_type', NEW.request_type
    ),
    NOW(),
    CASE 
      WHEN NEW.urgency_level = 'emergency' THEN NOW() + INTERVAL '24 hours'
      WHEN NEW.urgency_level = 'urgent' THEN NOW() + INTERVAL '72 hours'
      ELSE NOW() + INTERVAL '7 days'
    END
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_provider_visible_records(current_user_id uuid)
 RETURNS TABLE(id uuid, patient_id uuid, record_type text, encrypted_data text, created_at timestamp with time zone, permission_type text, patient_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;