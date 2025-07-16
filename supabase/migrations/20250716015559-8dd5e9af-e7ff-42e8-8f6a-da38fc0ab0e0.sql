-- Create function to revoke sharing permissions with proper audit logging
CREATE OR REPLACE FUNCTION public.revoke_sharing_permission(permission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        permission_id::text,
        'success',
        'Patient revoked sharing permission for provider ' || permission_record.grantee_id,
        NOW()
    );
END;
$$;