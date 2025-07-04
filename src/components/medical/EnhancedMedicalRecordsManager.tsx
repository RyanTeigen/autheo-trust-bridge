
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnhancedMedicalRecords } from '@/hooks/useEnhancedMedicalRecords';
import { DecryptedRecord } from '@/types/medical';
import { Plus, Shield, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SimpleMedicalRecordForm from './SimpleMedicalRecordForm';
import MedicalRecordCard from './MedicalRecordCard';
import EmptyRecordsState from './EmptyRecordsState';

const EnhancedMedicalRecordsManager: React.FC = () => {
  const {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord
  } = useEnhancedMedicalRecords();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DecryptedRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      await deleteRecord(id);
    }
  };

  const handleEdit = (record: DecryptedRecord) => {
    setEditingRecord(record);
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditDialogClose = () => {
    setEditingRecord(null);
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading medical records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Medical Records</h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4" />
            Securely encrypted and access-controlled medical information
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Medical Record</DialogTitle>
              <DialogDescription>
                Add a new encrypted medical record to your profile.
              </DialogDescription>
            </DialogHeader>
            
            <SimpleMedicalRecordForm
              onSubmit={async (data) => {
                const success = editingRecord 
                  ? await updateRecord(editingRecord.id, data)
                  : await createRecord(data);
                
                if (success) {
                  if (editingRecord) {
                    setEditingRecord(null);
                  } else {
                    setIsCreateDialogOpen(false);
                  }
                }
              }}
              onCancel={handleCreateDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {records.length === 0 ? (
        <EmptyRecordsState onCreateRecord={() => setIsCreateDialogOpen(true)} />
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Medical Record</DialogTitle>
              <DialogDescription>
                Update your encrypted medical record.
              </DialogDescription>
            </DialogHeader>
            
            <SimpleMedicalRecordForm
              onSubmit={async (data) => {
                const success = await updateRecord(editingRecord.id, data);
                if (success) {
                  setEditingRecord(null);
                }
              }}
              onCancel={handleEditDialogClose}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedMedicalRecordsManager;
