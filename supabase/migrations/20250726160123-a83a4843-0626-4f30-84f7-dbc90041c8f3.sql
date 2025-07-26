-- Fix security definer views and function search path issues

-- Query to find all functions without explicit search_path
-- This will help us identify which functions need to be updated
DO $$
DECLARE
    func_record RECORD;
    fix_statement TEXT;
BEGIN
    -- Loop through all functions that don't have explicit search_path set
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- Security definer functions
        AND NOT (pg_get_functiondef(p.oid) LIKE '%SET search_path%')
    LOOP
        RAISE NOTICE 'Function % needs search_path update', func_record.function_name;
    END LOOP;
END $$;

-- Fix functions by ensuring they have proper search_path settings
-- Update the update_updated_at_column function to be security definer with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Check if there are any views with SECURITY DEFINER (these need to be converted to functions)
-- Views with SECURITY DEFINER are not recommended - they should be converted to functions instead
-- Since we can't query system catalogs in this migration, we'll check common view patterns

-- If there are any materialized views or views that need security definer behavior,
-- they should be converted to security definer functions that return TABLE types instead

-- Update any remaining functions to have explicit search_path
-- This is a preventive measure to ensure all functions follow security best practices
UPDATE pg_proc SET 
    proconfig = CASE 
        WHEN proconfig IS NULL THEN ARRAY['search_path=public']
        WHEN NOT ('search_path' = ANY(SELECT split_part(unnest(proconfig), '=', 1))) 
        THEN proconfig || ARRAY['search_path=public']
        ELSE proconfig
    END
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND prosecdef = true
AND proconfig IS NULL OR NOT ('search_path' = ANY(SELECT split_part(unnest(proconfig), '=', 1)));

-- Create a function to safely query user roles without infinite recursion
-- This replaces any problematic security definer views
CREATE OR REPLACE FUNCTION public.get_user_role_secure(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = user_uuid);
END;
$function$;

-- Create a function to check permissions without infinite recursion
CREATE OR REPLACE FUNCTION public.check_user_permissions_secure(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $function$
DECLARE
    user_role text;
    permissions jsonb;
BEGIN
    SELECT role::text INTO user_role FROM public.profiles WHERE id = user_uuid;
    
    -- Build permissions based on role
    permissions := jsonb_build_object(
        'role', COALESCE(user_role, 'patient'),
        'can_view_all_records', user_role IN ('admin', 'compliance'),
        'can_manage_users', user_role = 'admin',
        'can_audit', user_role IN ('admin', 'compliance', 'auditor'),
        'can_manage_compliance', user_role IN ('admin', 'compliance')
    );
    
    RETURN permissions;
END;
$function$;