-- Fix the audit_policy_acknowledgment function to use correct UUID type
CREATE OR REPLACE FUNCTION public.audit_policy_acknowledgment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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
    NEW.id,  -- Remove ::TEXT cast since resource_id is UUID type
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