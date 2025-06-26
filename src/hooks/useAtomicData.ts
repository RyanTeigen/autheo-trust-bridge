
import { useState, useCallback } from 'react';
import { atomicDataService, AtomicValue } from '@/services/atomic/AtomicDataService';
import { useToast } from '@/hooks/use-toast';

export const useAtomicData = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const decomposeRecord = useCallback(async (recordId: string, medicalData: any) => {
    setProcessing(true);
    try {
      console.log('Decomposing record to atomic values:', recordId, medicalData);
      
      const result = await atomicDataService.decomposeToAtomicValues(recordId, medicalData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully created ${result.atomicCount} atomic data points`,
        });
        return { success: true, atomicCount: result.atomicCount };
      } else {
        toast({
          title: "Decomposition Failed",
          description: result.error || "Failed to decompose record to atomic values",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error decomposing record:', error);
      toast({
        title: "Error",
        description: "Unexpected error during decomposition",
        variant: "destructive",
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const storeAtomicValue = useCallback(async (recordId: string, atomicValue: AtomicValue) => {
    setProcessing(true);
    try {
      console.log('Storing atomic value:', recordId, atomicValue);
      
      const result = await atomicDataService.storeAtomicValue(recordId, atomicValue);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Atomic value stored successfully",
        });
        return { success: true, id: result.id };
      } else {
        toast({
          title: "Storage Failed",
          description: result.error || "Failed to store atomic value",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error storing atomic value:', error);
      toast({
        title: "Error",
        description: "Unexpected error storing atomic value",
        variant: "destructive",
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const getAtomicValuesByType = useCallback(async (dataType: string, limit = 100) => {
    try {
      console.log('Fetching atomic values by type:', dataType);
      
      const result = await atomicDataService.getAtomicValuesByType(dataType, limit);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        toast({
          title: "Fetch Failed",
          description: result.error || "Failed to fetch atomic values",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error fetching atomic values:', error);
      toast({
        title: "Error",
        description: "Unexpected error fetching atomic values",
        variant: "destructive",
      });
      return { success: false, error: 'Unexpected error' };
    }
  }, [toast]);

  return {
    processing,
    decomposeRecord,
    storeAtomicValue,
    getAtomicValuesByType
  };
};
