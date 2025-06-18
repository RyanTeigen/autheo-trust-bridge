
import { useState, useEffect } from 'react';
import { useMedicalRecordsAPI } from '@/hooks/useMedicalRecordsAPI';
import { useToast } from '@/hooks/use-toast';

interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

export const useMedicalRecordsManager = () => {
  const [records, setRecords] = useState<DecryptedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const { getRecords, createRecord, updateRecord, deleteRecord } = useMedicalRecordsAPI();
  const { toast } = useToast();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getRecords(
        { limit: 50, offset: 0 },
        { recordType: filterType === 'all' ? undefined : filterType }
      );
      
      if (response.success) {
        const decryptedRecords = response.data.records.map((record: any) => ({
          id: record.id,
          patient_id: record.patient_id,
          data: JSON.parse(record.encrypted_data),
          record_type: record.record_type,
          created_at: record.created_at,
          updated_at: record.updated_at
        }));
        setRecords(decryptedRecords);
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
      const response = await createRecord({
        ...data,
        recordType: data.recordType || 'general'
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Medical record created successfully",
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
    try {
      const response = await updateRecord(id, data);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
        fetchRecords();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update record",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update medical record",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const success = await deleteRecord(id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Medical record deleted successfully",
        });
        fetchRecords();
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete record",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive",
      });
      return false;
    }
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
