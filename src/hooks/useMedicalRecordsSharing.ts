
import { useState } from 'react';
import { medicalRecordsSharing } from '@/services/medical/MedicalRecordsSharing';
import { useToast } from '@/hooks/use-toast';

export const useMedicalRecordsSharing = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const shareRecord = async (recordId: string, recipientUserId: string) => {
    setLoading(true);
    try {
      const result = await medicalRecordsSharing.shareRecord({
        recordId,
        recipientUserId
      });

      if (result.success) {
        toast({
          title: "Record Shared Successfully",
          description: "The medical record has been securely shared with quantum-safe encryption.",
        });
        return result;
      } else {
        toast({
          title: "Sharing Failed",
          description: result.error || "Failed to share record",
          variant: "destructive",
        });
        return result;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sharing the record",
        variant: "destructive",
      });
      return { success: false, error: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  };

  const getSharedWithMe = async () => {
    setLoading(true);
    try {
      const result = await medicalRecordsSharing.getSharedWithMe();
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shared records",
        variant: "destructive",
      });
      return { success: false, error: "Failed to fetch shared records" };
    } finally {
      setLoading(false);
    }
  };

  const getMyShares = async () => {
    setLoading(true);
    try {
      const result = await medicalRecordsSharing.getMyShares();
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sharing records",
        variant: "destructive",
      });
      return { success: false, error: "Failed to fetch sharing records" };
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId: string) => {
    setLoading(true);
    try {
      const result = await medicalRecordsSharing.revokeShare(shareId);
      
      if (result.success) {
        toast({
          title: "Share Revoked",
          description: "The record share has been successfully revoked.",
        });
        return result;
      } else {
        toast({
          title: "Revocation Failed",
          description: result.error || "Failed to revoke share",
          variant: "destructive",
        });
        return result;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while revoking the share",
        variant: "destructive",
      });
      return { success: false, error: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  };

  const getSharedRecord = async (shareId: string) => {
    setLoading(true);
    try {
      const result = await medicalRecordsSharing.getSharedRecord(shareId);
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access shared record",
        variant: "destructive",
      });
      return { success: false, error: "Failed to access shared record" };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    shareRecord,
    getSharedWithMe,
    getMyShares,
    revokeShare,
    getSharedRecord
  };
};
