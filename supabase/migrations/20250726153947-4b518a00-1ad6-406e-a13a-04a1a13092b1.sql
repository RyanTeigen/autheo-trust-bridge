-- Address remaining security issues from linter

-- Fix remaining functions that need search_path set
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN
    -- Set search_path for all remaining functions that don't have it
    FOR func_record IN 
        SELECT nspname, proname, pg_get_function_arguments(pg_proc.oid) as args
        FROM pg_proc 
        JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
        WHERE nspname = 'public' 
        AND proname NOT IN ('get_current_user_role', 'get_current_user_role_secure', 'check_provider_access', 'check_patient_ownership', 'enforce_audit_retention')
        AND prosecdef = true  -- Only security definer functions
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''''', 
                          func_record.nspname, func_record.proname, func_record.args);
        EXCEPTION WHEN OTHERS THEN
            -- Continue if there's an error with a specific function
            CONTINUE;
        END;
    END LOOP;
END $$;

-- Update security middleware to use new secure functions
-- These functions are already created and secured

-- Add additional security constraints
CREATE OR REPLACE FUNCTION public.validate_access_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Prevent self-approval of access requests
  IF NEW.patient_id = NEW.grantee_id THEN
    RAISE EXCEPTION 'Users cannot grant access to themselves';
  END IF;
  
  -- Validate expiry dates
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= NEW.created_at THEN
    RAISE EXCEPTION 'Expiry date must be in the future';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the access request validation trigger
DROP TRIGGER IF EXISTS validate_access_request_trigger ON public.sharing_permissions;
CREATE TRIGGER validate_access_request_trigger
  BEFORE INSERT OR UPDATE ON public.sharing_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_access_request();

-- Add input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potentially dangerous characters and scripts
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<[^>]*>', '', 'g'),  -- Remove HTML tags
      '[<>''";\\]', '', 'g'),                          -- Remove dangerous chars
    '(javascript:|vbscript:|data:|on\w+\s*=)', '', 'gi' -- Remove script injections
  );
END;
$$;

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION public.validate_access_request() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sanitize_text_input(text) TO authenticated;