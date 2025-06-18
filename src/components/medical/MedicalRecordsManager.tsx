
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMedicalRecordsAPI } from '@/hooks/useMedicalRecordsAPI';
import { useToast } from '@/hooks/use-toast';
import MedicalRecordForm from './MedicalRecordForm';
import EmptyRecordsState from './EmptyRecordsState';

interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

const MedicalRecordsManager = () => {
  const [records, setRecords] = useState<DecryptedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DecryptedRecord | null>(null);
  
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
        // Decrypt the records for display
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

  useEffect(() => {
    fetchRecords();
  }, [filterType]);

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
        setShowCreateForm(false);
        fetchRecords();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive",
      });
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
        setSelectedRecord(null);
        fetchRecords();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update medical record",
        variant: "destructive",
      });
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
      } else {
        toast({
          title: "Error",
          description: "Failed to delete record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive",
      });
    }
  };

  const filteredRecords = records.filter(record =>
    record.data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.data.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showCreateForm) {
    return (
      <MedicalRecordForm
        onSubmit={handleCreateRecord}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (selectedRecord) {
    return (
      <MedicalRecordForm
        record={selectedRecord}
        onSubmit={(data) => handleUpdateRecord(selectedRecord.id, data)}
        onCancel={() => setSelectedRecord(null)}
        onDelete={() => handleDeleteRecord(selectedRecord.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="physical_exam">Physical Exam</SelectItem>
              <SelectItem value="lab_results">Lab Results</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyRecordsState onCreateRecord={() => setShowCreateForm(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader onClick={() => setSelectedRecord(record)}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{record.data.title || 'Untitled Record'}</CardTitle>
                    <CardDescription>
                      {new Date(record.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{record.record_type}</Badge>
                </div>
              </CardHeader>
              <CardContent onClick={() => setSelectedRecord(record)}>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {record.data.description || record.data.diagnosis || 'No description available'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsManager;
