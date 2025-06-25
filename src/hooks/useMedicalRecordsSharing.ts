
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuantumSafeSharing } from './useQuantumSafeSharing';

export const useMedicalRecordsSharing = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const quantumSharing = useQuantumSafeSharing();

  const shareRecord = async (recordId: string, recipientUserId: string) => {
    return await quantumSharing.shareRecord(recordId, recipientUserId);
  };

  const getSharedWithMe = async (options = {}) => {
    return await quantumSharing.getSharedWithMe(options);
  };

  const getMyShares = async (options = {}, filters = {}) => {
    return await quantumSharing.getMyShares(options, filters);
  };

  const revokeShare = async (shareId: string) => {
    return await quantumSharing.revokeShare(shareId);
  };

  const updateShare = async (shareId: string, updates: any) => {
    return await quantumSharing.updateShare(shareId, updates);
  };

  const getShareById = async (shareId: string) => {
    return await quantumSharing.getShareById(shareId);
  };

  const getSharedRecord = async (shareId: string) => {
    setLoading(true);
    try {
      // Get the share details first
      const shareResult = await quantumSharing.getShareById(shareId);
      if (!shareResult.success) {
        return shareResult;
      }

      const share = shareResult.data;
      
      // This would implement the actual record decryption logic
      // For now, return structured data
      const mockRecord = {
        shareId: share.id,
        recordId: share.record_id,
        recordType: share.medical_records.record_type,
        sharedAt: share.created_at,
        sharedBy: {
          name: share.medical_records.patients.full_name,
          email: share.medical_records.patients.email
        },
        encrypted: true,
        message: 'Record access via quantum-safe sharing',
        encryptionDetails: {
          algorithm: 'ML-KEM-768',
          keyEncapsulation: JSON.parse(share.pq_encrypted_key)
        }
      };

      return { success: true, data: mockRecord };
    } catch (error: any) {
      console.error('Error in getSharedRecord:', error);
      toast({
        title: "Error",
        description: "Failed to access shared record",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading: loading || quantumSharing.loading,
    shareRecord,
    getSharedWithMe,
    getMyShares,
    revokeShare,
    updateShare,
    getShareById,
    getSharedRecord
  };
};
