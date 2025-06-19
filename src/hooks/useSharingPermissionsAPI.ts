
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from './useAuditLog';

interface SharingPermission {
  id: string;
  patient_id: string;
  grantee_id: string;
  medical_record_id: string;
  permission_type: 'read' | 'write';
  created_at: string;
  expires_at?: string;
}

interface CreateSharingPermissionData {
  medicalRecordId: string;
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

interface GetSharingPermissionsOptions {
  limit?: number;
  offset?: number;
  granteeId?: string;
  permissionType?: string;
  status?: string;
}

export const useSharingPermissionsAPI = () => {
  const [loading, setLoading] = useState(false);
  const { logAccess, logCreate, logUpdate, logDelete, logError } = useAuditLog();

  const getSharingPermissions = async (options: GetSharingPermissionsOptions = {}) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const { limit = 50, offset = 0, granteeId, permissionType, status } = options;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (granteeId) params.append('granteeId', granteeId);
      if (permissionType) params.append('permissionType', permissionType);
      if (status) params.append('status', status);

      const response = await fetch(`/api/sharing-permissions?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        await logAccess('sharing_permissions', undefined, `Retrieved ${result.data.permissions.length} sharing permissions`);
        return result;
      } else {
        await logError('GET_SHARING_PERMISSIONS', 'sharing_permissions', result.error);
        return result;
      }
    } catch (error) {
      await logError('GET_SHARING_PERMISSIONS', 'sharing_permissions', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error fetching sharing permissions:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const createSharingPermission = async (data: CreateSharingPermissionData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch('/api/sharing-permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        await logCreate('sharing_permission', result.data.id, `Granted ${data.permissionType} permission to ${data.granteeId}`);
        return result;
      } else {
        await logError('CREATE_SHARING_PERMISSION', 'sharing_permission', result.error);
        return result;
      }
    } catch (error) {
      await logError('CREATE_SHARING_PERMISSION', 'sharing_permission', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error creating sharing permission:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const updateSharingPermission = async (id: string, data: Partial<CreateSharingPermissionData>) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/sharing-permissions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        await logUpdate('sharing_permission', id, 'Updated sharing permission');
        return result;
      } else {
        await logError('UPDATE_SHARING_PERMISSION', 'sharing_permission', result.error, id);
        return result;
      }
    } catch (error) {
      await logError('UPDATE_SHARING_PERMISSION', 'sharing_permission', error instanceof Error ? error.message : 'Unknown error', id);
      console.error('Error updating sharing permission:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const revokeSharingPermission = async (id: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/sharing-permissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        await logDelete('sharing_permission', id, 'Revoked sharing permission');
        return result;
      } else {
        await logError('REVOKE_SHARING_PERMISSION', 'sharing_permission', result.error, id);
        return result;
      }
    } catch (error) {
      await logError('REVOKE_SHARING_PERMISSION', 'sharing_permission', error instanceof Error ? error.message : 'Unknown error', id);
      console.error('Error revoking sharing permission:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getSharingPermissions,
    createSharingPermission,
    updateSharingPermission,
    revokeSharingPermission
  };
};
