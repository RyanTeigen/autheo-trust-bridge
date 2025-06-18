
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

interface MedicalRecordFormProps {
  record?: DecryptedRecord;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  record,
  onSubmit,
  onCancel,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    recordType: 'general'
  });
  const [loading, setLoading] = useState(false);

  // Populate form data when editing an existing record
  useEffect(() => {
    if (record) {
      setFormData({
        title: record.data.title || '',
        description: record.data.description || '',
        diagnosis: record.data.diagnosis || '',
        treatment: record.data.treatment || '',
        notes: record.data.notes || '',
        recordType: record.record_type || 'general'
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this record?')) {
      setLoading(true);
      try {
        await onDelete();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Records
        </Button>
        {record && onDelete && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Record
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {record ? 'Edit Medical Record' : 'Create New Medical Record'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Record title"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Record Type</label>
              <Select
                value={formData.recordType}
                onValueChange={(value) => setFormData({ ...formData, recordType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="physical_exam">Physical Exam</SelectItem>
                  <SelectItem value="lab_results">Lab Results</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Record description"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Diagnosis</label>
              <Textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Diagnosis details"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Treatment</label>
              <Textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="Treatment plan"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (record ? 'Updating...' : 'Creating...') : (record ? 'Update Record' : 'Create Record')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecordForm;
