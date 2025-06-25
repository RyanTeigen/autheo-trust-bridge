
import { useState } from 'react';
import { useQuantumSafeSharing } from './useQuantumSafeSharing';
import { useToast } from '@/hooks/use-toast';

interface SharingPermissionFilters {
  granteeId?: string;
  permissionType?: string;
  status?: 'active' | 'expired' | 'all';
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface CreateSharingPermissionInput {
  medicalRecordId: string;
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

export const useSharingPermissionsAPI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const quantumSharing = useQuantumSafeSharing();

  const getSharingPermissions = async (
    options: PaginationOptions = {},
    filters: SharingPermissionFilters = {}
  ) => {
    setLoading(true);
    try {
      const result = await quantumSharing.getMyShares(options, filters);
      
      if (result.success) {
        // Transform the quantum shares data to match the expected sharing permissions format
        const transformedData = {
          success: true,
          data: {
            permissions: result.data.permissions.map((share: any) => ({
              id: share.id,
              patient_id: share.medical_records?.patient_id,
              grantee_id: share.shared_with_user_id,
              medical_record_id: share.record_id,
              permission_type: 'read', // Default for quantum shares
              created_at: share.created_at,
              expires_at: null // Current schema doesn't have expiration
            })),
            totalCount: result.data.totalCount,
            pagination: result.data.pagination
          }
        };
        
        return transformedData;
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in getSharingPermissions:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getSharingPermission = async (permissionId: string) => {
    return await quantumSharing.getShareById(permissionId);
  };

  const shareRecordWithProvider = async (input: CreateSharingPermissionInput) => {
    setLoading(true);
    try {
      // Validate permission type
      if (!['read', 'write'].includes(input.permissionType)) {
        return { 
          success: false, 
          error: 'Permission type must be "read" or "write"' 
        };
      }

      const result = await quantumSharing.shareRecord(input.medicalRecordId, input.granteeId);
      
      if (result.success) {
        // Transform the result to match expected format
        const transformedResult = {
          success: true,
          data: {
            id: result.data.id,
            patient_id: null, // Will be populated by the database
            grantee_id: result.data.shared_with_user_id,
            medical_record_id: result.data.record_id,
            permission_type: input.permissionType,
            created_at: result.data.created_at,
            expires_at: input.expiresAt || null
          }
        };
        
        toast({
          title: "Permission Created",
          description: "Sharing permission has been created successfully using quantum-safe encryption.",
        });
        
        return transformedResult;
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in shareRecordWithProvider:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateSharingPermission = async (
    permissionId: string,
    updates: { permissionType?: 'read' | 'write'; expiresAt?: string }
  ) => {
    return await quantumSharing.updateShare(permissionId, updates);
  };

  const revokeSharingPermission = async (permissionId: string) => {
    const result = await quantumSharing.revokeShare(permissionId);
    
    if (result.success) {
      toast({
        title: "Permission Revoked",
        description: "Sharing permission has been successfully revoked.",
      });
      return true; // Return boolean for backward compatibility
    }
    
    return false;
  };

  return {
    loading: loading || quantumSharing.loading,
    getSharingPermissions,
    getSharingPermission,
    shareRecordWithProvider,
    updateSharingPermission,
    revokeSharingPermission
  };
};
