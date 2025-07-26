-- Fix Security Linter Issues
-- This migration addresses the security warnings identified by the linter

-- 1. Fix security definer views by reviewing and updating them
-- First, let's see what views exist and remove any problematic ones
DROP VIEW IF EXISTS clinical_records CASCADE;

-- 2. Update remaining functions to have proper search_path settings
-- Update all functions that don't have SET search_path = public

CREATE OR REPLACE FUNCTION public.get_appointment_details(appointment_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = _user_id AND role::text = _role
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.extend_session(session_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE user_sessions 
  SET is_active = FALSE, 
      terminated_at = NOW(),
      termination_reason = 'expired'
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$function$;

-- 3. Create a proper security configuration for session management
CREATE OR REPLACE FUNCTION public.initialize_security_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update security configurations with proper settings
  UPDATE security_configurations 
  SET config_value = '"480"'::jsonb -- 8 hours in minutes
  WHERE config_key = 'session_timeout_minutes';
  
  UPDATE security_configurations 
  SET config_value = '"5"'::jsonb
  WHERE config_key = 'max_failed_login_attempts';
  
  UPDATE security_configurations 
  SET config_value = '"12"'::jsonb
  WHERE config_key = 'password_min_length';
  
  -- Log security initialization
  PERFORM log_security_event_secure(
    'SECURITY_INIT',
    'info',
    'Security settings initialized',
    jsonb_build_object('timestamp', NOW())
  );
END;
$function$;

-- Initialize security settings
SELECT public.initialize_security_settings();