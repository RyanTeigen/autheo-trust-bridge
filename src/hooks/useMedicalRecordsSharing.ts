
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

  const getSharedWithMe = async () => {
    return await quantumSharing.getSharedWithMe();
  };

  const getMyShares = async () => {
    return await quantumSharing.getMyShares();
  };

  const revokeShare = async (shareId: string) => {
    return await quantumSharing.revokeShare(shareId);
  };

  const getSharedRecord = async (shareId: string) => {
    setLoading(true);
    try {
      // This would implement the actual record decryption logic
      // For now, return mock data
      const mockRecord = {
        shareId: shareId,
        recordId: `record_${shareId}`,
        recordType: 'Medical Report',
        sharedAt: new Date().toISOString(),
        encrypted: true,
        message: 'Record access via quantum-safe sharing'
      };

      return { success: true, data: mockRecord };
    } catch (error: any) {
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
    getSharedRecord
  };
};
