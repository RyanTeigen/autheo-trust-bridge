
import { useCallback } from 'react';
import { useAuthenticatedFetch } from './use-authenticated-fetch';

interface SharingPermission {
  id: string;
  patient_id: string;
  grantee_id: string;
  medical_record_id: string;
  permission_type: 'read' | 'write';
  created_at: string;
  expires_at?: string;
}

interface CreateSharingPermissionInput {
  medicalRecordId: string;
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface SharingPermissionFilters {
  granteeId?: string;
  permissionType?: 'read' | 'write';
  status?: 'active' | 'expired' | 'all';
}

export const useSharingPermissionsAPI = () => {
  const authenticatedFetch = useAuthenticatedFetch();

  const getSharingPermissions = useCallback(async (options: PaginationOptions = {}, filters: SharingPermissionFilters = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (filters.granteeId) params.append('granteeId', filters.granteeId);
    if (filters.permissionType) params.append('permissionType', filters.permissionType);
    if (filters.status) params.append('status', filters.status);
    
    const response = await authenticatedFetch(`/api/sharing-permissions?${params}`);
    return response.json();
  }, [authenticatedFetch]);

  const getSharingPermission = useCallback(async (id: string) => {
    const response = await authenticatedFetch(`/api/sharing-permissions/${id}`);
    return response.json();
  }, [authenticatedFetch]);

  const createSharingPermission = useCallback(async (data: CreateSharingPermissionInput) => {
    const response = await authenticatedFetch('/api/sharing-permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const updateSharingPermission = useCallback(async (id: string, data: { permissionType?: 'read' | 'write'; expiresAt?: string }) => {
    const response = await authenticatedFetch(`/api/sharing-permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const revokeSharingPermission = useCallback(async (id: string) => {
    const response = await authenticatedFetch(`/api/sharing-permissions/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }, [authenticatedFetch]);

  return {
    getSharingPermissions,
    getSharingPermission,
    createSharingPermission,
    updateSharingPermission,
    revokeSharingPermission,
  };
};
