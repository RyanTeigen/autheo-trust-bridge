
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MedicalRecordFormData {
  title: string;
  description: string;
  category: string;
  notes: string;
}

interface MedicalRecordFormProps {
  formData: MedicalRecordFormData;
  setFormData: React.Dispatch<React.SetStateAction<MedicalRecordFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  isEditing?: boolean;
  onCancel: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  isEditing = false,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        <label className="text-sm font-medium">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
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
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Record' : 'Create Record')}
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
  );
};

export default MedicalRecordForm;
