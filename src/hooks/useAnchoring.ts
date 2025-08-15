import { useState, useEffect, useCallback } from 'react';
import { AnchoringService, AnchoringQueueEntry, AnchoredHash } from '@/services/blockchain/AnchoringService';
import { useToast } from '@/hooks/use-toast';

export interface UseAnchoringReturn {
  queueEntries: AnchoringQueueEntry[];
  anchoredHashes: AnchoredHash[];
  isLoading: boolean;
  queueForAnchoring: (auditHash: string, logCount: number) => Promise<boolean>;
  triggerAnchoring: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  getAnchoringStatus: (auditHash: string) => Promise<any>;
}

export const useAnchoring = (): UseAnchoringReturn => {
  const [queueEntries, setQueueEntries] = useState<AnchoringQueueEntry[]>([]);
  const [anchoredHashes, setAnchoredHashes] = useState<AnchoredHash[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const anchoringService = AnchoringService.getInstance();

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [queue, anchored] = await Promise.all([
        anchoringService.getQueueStatus(),
        anchoringService.getAnchoredHashes()
      ]);
      
      setQueueEntries(queue);
      setAnchoredHashes(anchored);
    } catch (error) {
      console.error('Failed to refresh anchoring data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [anchoringService]);

  const queueForAnchoring = useCallback(async (auditHash: string, logCount: number): Promise<boolean> => {
    try {
      const success = await anchoringService.queueForAnchoring(auditHash, logCount);
      
      if (success) {
        toast({
          title: "Queued for Anchoring",
          description: "Audit hash has been queued for blockchain anchoring.",
        });
        await refreshData();
      } else {
        toast({
          title: "Failed to Queue",
          description: "Could not queue audit hash for anchoring.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while queuing for anchoring.",
        variant: "destructive",
      });
      return false;
    }
  }, [anchoringService, toast, refreshData]);

  const triggerAnchoring = useCallback(async (): Promise<boolean> => {
    try {
      const success = await anchoringService.triggerAnchoring();
      
      if (success) {
        toast({
          title: "Anchoring Triggered",
          description: "Blockchain anchoring process has been initiated.",
        });
        // Refresh data after a short delay to see updated statuses
        setTimeout(refreshData, 2000);
      } else {
        toast({
          title: "Failed to Trigger",
          description: "Could not initiate blockchain anchoring.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while triggering anchoring.",
        variant: "destructive",
      });
      return false;
    }
  }, [anchoringService, toast, refreshData]);

  const getAnchoringStatus = useCallback(async (auditHash: string) => {
    return await anchoringService.getAnchoringStatus(auditHash);
  }, [anchoringService]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    queueEntries,
    anchoredHashes,
    isLoading,
    queueForAnchoring,
    triggerAnchoring,
    refreshData,
    getAnchoringStatus
  };
};