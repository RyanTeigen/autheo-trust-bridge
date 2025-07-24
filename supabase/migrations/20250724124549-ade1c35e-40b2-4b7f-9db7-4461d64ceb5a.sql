-- Fix remaining security definer functions missing search_path settings

-- Fix all trigger functions with SECURITY DEFINER that need search_path
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

CREATE OR REPLACE FUNCTION public.update_atomic_data_points_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_sharing_permissions_updated_at()
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

-- Fix audit and security related functions
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

CREATE OR REPLACE FUNCTION public.set_audit_retention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Set retention period based on data type
    IF NEW.phi_accessed = TRUE THEN
        NEW.retention_period := INTERVAL '7 years';
    ELSE
        NEW.retention_period := INTERVAL '3 years';
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_policy_acknowledgment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    status,
    details,
    metadata
  ) VALUES (
    NEW.user_id,
    'POLICY_ACKNOWLEDGED',
    'policy_acknowledgments',
    NEW.id,
    'success',
    'User acknowledged HIPAA policy version ' || NEW.policy_version,
    jsonb_build_object(
      'policy_version', NEW.policy_version,
      'ip_address', NEW.ip_address,
      'user_agent', NEW.user_agent,
      'acknowledged_at', NEW.acknowledged_at
    )
  );
  
  RETURN NEW;
END;
$function$;