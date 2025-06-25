
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureProviderHasAccess, checkRecordAccess, PermissionCheckResult } from '@/middleware/ensurePermission';

export interface AccessControlHook {
  checkAccess: (recordId: string, providerId: string) => Promise<PermissionCheckResult>;
  revokeAccess: (permissionId: string) => Promise<boolean>;
  loading: boolean;
}

export function useAccessControl(): AccessControlHook {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkAccess = useCallback(async (recordId: string, providerId: string): Promise<PermissionCheckResult> => {
    setLoading(true);
    try {
      const result = await checkRecordAccess(recordId, providerId);
      return result;
    } catch (error) {
      console.error('Error checking access:', error);
      return { hasAccess: false, reason: 'Error checking access permissions' };
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeAccess = useCallback(async (permissionId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('Error revoking access:', error);
        toast({
          title: "Error",
          description: "Failed to revoke access",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Access Revoked",
        description: "Provider access has been successfully revoked",
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error revoking access:', error);
      toast({
        title: "Error",
        description: "Unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    checkAccess,
    revokeAccess,
    loading
  };
}
