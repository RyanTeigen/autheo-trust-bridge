import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';

interface SimpleMedicalRecordFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const SimpleMedicalRecordForm: React.FC<SimpleMedicalRecordFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    provider: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    medications: '',
    allergies: '',
    vitals: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-slate-200">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Record title"
            required
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        
        <div>
          <Label htmlFor="category" className="text-slate-200">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="lab">Lab Results</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="medication">Medication</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="provider" className="text-slate-200">Healthcare Provider</Label>
          <Input
            id="provider"
            value={formData.provider}
            onChange={(e) => handleInputChange('provider', e.target.value)}
            placeholder="Dr. Smith, General Hospital"
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        
        <div>
          <Label htmlFor="date" className="text-slate-200">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-200">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the medical record details..."
          required
          rows={3}
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-slate-200">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes or observations..."
          rows={2}
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="medications" className="text-slate-200">Medications</Label>
          <Textarea
            id="medications"
            value={formData.medications}
            onChange={(e) => handleInputChange('medications', e.target.value)}
            placeholder="Current medications..."
            rows={2}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        
        <div>
          <Label htmlFor="allergies" className="text-slate-200">Allergies</Label>
          <Textarea
            id="allergies"
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            placeholder="Known allergies..."
            rows={2}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vitals" className="text-slate-200">Vital Signs</Label>
        <Input
          id="vitals"
          value={formData.vitals}
          onChange={(e) => handleInputChange('vitals', e.target.value)}
          placeholder="BP: 120/80, HR: 72, Temp: 98.6°F"
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
              Encrypting...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Create Record
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SimpleMedicalRecordForm;