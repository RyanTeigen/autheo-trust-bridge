
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MedicalRecordsEncryption } from '@/services/encryption/MedicalRecordsEncryption';

interface DecryptedRecord {
  id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    algorithm: string;
    timestamp: string;
    encrypted: boolean;
  };
}

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
    try {
      const response = await MedicalRecordsEncryption.createEncryptedRecord(
        data,
        data.category || 'general'
      );
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Medical record created and encrypted successfully",
        });
        fetchRecords();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create record",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive",
      });
      return false;
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
