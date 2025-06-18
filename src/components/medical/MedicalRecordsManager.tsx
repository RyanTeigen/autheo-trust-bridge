
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { MedicalRecordsService, DecryptedMedicalRecord } from '@/services/MedicalRecordsService';
import { Plus, Edit, Trash2, Shield, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MedicalRecordsManager: React.FC = () => {
  const [records, setRecords] = useState<DecryptedMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DecryptedMedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    recordType: 'general'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const result = await MedicalRecordsService.getRecords();
      if (result.success && result.records) {
        setRecords(result.records);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch records",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medical records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    try {
      const recordData = {
        title: formData.title,
        description: formData.description,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        timestamp: new Date().toISOString()
      };

      const result = await MedicalRecordsService.createRecord(recordData, formData.recordType);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Medical record created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchRecords();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create record",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      const recordData = {
        title: formData.title,
        description: formData.description,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        timestamp: editingRecord.data.timestamp,
        lastUpdated: new Date().toISOString()
      };

      const result = await MedicalRecordsService.updateRecord(editingRecord.id, recordData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update record",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medical record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical record?')) return;

    try {
      const result = await MedicalRecordsService.deleteRecord(id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Medical record deleted successfully",
        });
        fetchRecords();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete record",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: DecryptedMedicalRecord) => {
    setEditingRecord(record);
    setFormData({
      title: record.data.title || '',
      description: record.data.description || '',
      diagnosis: record.data.diagnosis || '',
      treatment: record.data.treatment || '',
      notes: record.data.notes || '',
      recordType: record.record_type
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      recordType: 'general'
    });
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'imaging': return 'bg-purple-100 text-purple-800';
      case 'prescription': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
          <h2 className="text-2xl font-bold">Encrypted Medical Records</h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4" />
            All records are encrypted on your device before storage
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
                Add a new encrypted medical record to your secure vault.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Record Type</label>
                <Select value={formData.recordType} onValueChange={(value) => setFormData(prev => ({ ...prev, recordType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="lab">Lab Results</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Record title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Record description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Diagnosis</label>
                <Input
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnosis"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Treatment</label>
                <Textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Treatment details"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateRecord} className="flex-1">
                  Create Record
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first encrypted medical record to get started.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {record.data.title || 'Untitled Record'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRecordTypeColor(record.record_type)}>
                        {record.record_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {record.data.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {record.data.error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {record.data.description && (
                      <div>
                        <strong>Description:</strong>
                        <p className="text-gray-700">{record.data.description}</p>
                      </div>
                    )}
                    {record.data.diagnosis && (
                      <div>
                        <strong>Diagnosis:</strong>
                        <p className="text-gray-700">{record.data.diagnosis}</p>
                      </div>
                    )}
                    {record.data.treatment && (
                      <div>
                        <strong>Treatment:</strong>
                        <p className="text-gray-700">{record.data.treatment}</p>
                      </div>
                    )}
                    {record.data.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p className="text-gray-700">{record.data.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
            <DialogDescription>
              Update your encrypted medical record.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Record title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Record description"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Diagnosis</label>
              <Input
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Diagnosis"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Treatment</label>
              <Textarea
                value={formData.treatment}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Treatment details"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateRecord} className="flex-1">
                Update Record
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingRecord(null);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecordsManager;
