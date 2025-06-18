
import { useState, useCallback } from 'react';
import { enhancedMedicalRecordsService } from '@/services/EnhancedMedicalRecordsService';
import { DecryptedMedicalRecord } from '@/types/medical';
import { useToast } from '@/hooks/use-toast';
import { sanitizeErrorForUser } from '@/utils/errorHandling';

export function useEnhancedMedicalRecords() {
  const [records, setRecords] = useState<DecryptedMedicalRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const showError = useCallback((error: string, title: string = "Error") => {
    toast({
      title,
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const showSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await enhancedMedicalRecordsService.getRecords();
      
      if (response.success && response.data) {
        setRecords(response.data.records);
        setTotalCount(response.data.totalCount);
        setPagination(response.data.pagination);
      } else {
        const errorMessage = sanitizeErrorForUser(response as any);
        setError(errorMessage);
        showError(errorMessage, "Failed to fetch records");
      }
    } catch (err) {
      const errorMessage = "Failed to fetch medical records";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createRecord = useCallback(async (data: any, recordType?: string) => {
    setLoading(true);
    
    try {
      const response = await enhancedMedicalRecordsService.createRecord(data, recordType);
      
      if (response.success) {
        showSuccess("Medical record created successfully");
        await fetchRecords(); // Refresh the list
        return response.data;
      } else {
        const errorMessage = sanitizeErrorForUser(response as any);
        showError(errorMessage, "Failed to create record");
        return null;
      }
    } catch (err) {
      showError("Failed to create medical record");
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess, fetchRecords]);

  const updateRecord = useCallback(async (id: string, data: any) => {
    setLoading(true);
    
    try {
      const response = await enhancedMedicalRecordsService.updateRecord(id, data);
      
      if (response.success) {
        showSuccess("Medical record updated successfully");
        await fetchRecords(); // Refresh the list
        return true;
      } else {
        const errorMessage = sanitizeErrorForUser(response as any);
        showError(errorMessage, "Failed to update record");
        return false;
      }
    } catch (err) {
      showError("Failed to update medical record");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess, fetchRecords]);

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true);
    
    try {
      const response = await enhancedMedicalRecordsService.deleteRecord(id);
      
      if (response.success) {
        showSuccess("Medical record deleted successfully");
        await fetchRecords(); // Refresh the list
        return true;
      } else {
        const errorMessage = sanitizeErrorForUser(response as any);
        showError(errorMessage, "Failed to delete record");
        return false;
      }
    } catch (err) {
      showError("Failed to delete medical record");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess, fetchRecords]);

  const getRecord = useCallback(async (id: string) => {
    setLoading(true);
    
    try {
      const response = await enhancedMedicalRecordsService.getRecord(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = sanitizeErrorForUser(response as any);
        showError(errorMessage, "Failed to fetch record");
        return null;
      }
    } catch (err) {
      showError("Failed to fetch medical record");
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return {
    records,
    totalCount,
    pagination,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecord
  };
}
