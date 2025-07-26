
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MedicalRecordsEncryption, DecryptedRecord } from '@/services/encryption/MedicalRecordsEncryption';

export const useMedicalRecordsManager = () => {
  const [records, setRecords] = useState<DecryptedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const { toast } = useToast();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await MedicalRecordsEncryption.getDecryptedRecords();
      
      if (response.success && response.records) {
        const filteredRecords = response.records.filter(record => {
          if (filterType === 'all') return true;
          return record.record_type === filterType;
        });
        setRecords(filteredRecords);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch records",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch medical records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (data: any) => {
    setLoading(true);
    try {
      // Input validation
      if (!data || typeof data !== 'object') {
        toast({
          title: "Validation Error",
          description: "Invalid record data provided",
          variant: "destructive",
        });
        return false;
      }

      console.log('Creating medical record with data:', { ...data, sensitiveData: '[REDACTED]' });
      
      const response = await MedicalRecordsEncryption.createEncryptedRecord(
        data,
        data.category || 'general'
      );
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Medical record created and encrypted successfully",
        });
        
        // Refresh records with better error handling
        try {
          await fetchRecords();
        } catch (fetchError) {
          console.warn('Failed to refresh records after creation:', fetchError);
          // Don't fail the whole operation if we can't refresh
        }
        
        return true;
      } else {
        const errorMessage = response.error || "Failed to create record";
        console.error('Record creation failed:', errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Unexpected error creating record:', error);
      
      let userMessage = "Failed to create medical record";
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          userMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('authentication')) {
          userMessage = "Authentication error. Please log in again.";
        }
      }
      
      toast({
        title: "Error",
        description: userMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (id: string, data: any) => {
    // TODO: Implement update functionality with encryption
    toast({
      title: "Info",
      description: "Update functionality will be implemented with re-encryption",
      variant: "default",
    });
    return false;
  };

  const handleDeleteRecord = async (id: string) => {
    // TODO: Implement delete functionality
    toast({
      title: "Info", 
      description: "Delete functionality will be implemented",
      variant: "default",
    });
    return false;
  };

  const filteredRecords = records.filter(record =>
    record.data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.data.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchRecords();
  }, [filterType]);

  return {
    records: filteredRecords,
    loading,
    searchTerm,
    filterType,
    setSearchTerm,
    setFilterType,
    handleCreateRecord,
    handleUpdateRecord,
    handleDeleteRecord,
    fetchRecords
  };
};
