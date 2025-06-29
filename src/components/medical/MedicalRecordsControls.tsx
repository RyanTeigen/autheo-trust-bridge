
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
import { ExportRecordsButton } from '@/components/patient/ExportRecordsButton';

interface MedicalRecordsControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  recordType: string;
  onRecordTypeChange: (value: string) => void;
  onCreateNew: () => void;
  showCreateButton?: boolean;
  patientId?: string;
}

export function MedicalRecordsControls({
  searchTerm,
  onSearchChange,
  recordType,
  onRecordTypeChange,
  onCreateNew,
  showCreateButton = true,
  patientId
}: MedicalRecordsControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search medical records..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={recordType} onValueChange={onRecordTypeChange}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
            <SelectItem value="heart_rate">Heart Rate</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
            <SelectItem value="height">Height</SelectItem>
            <SelectItem value="allergy">Allergy</SelectItem>
            <SelectItem value="medication">Medication</SelectItem>
            <SelectItem value="note">Clinical Note</SelectItem>
          </SelectContent>
        </Select>

        <ExportRecordsButton patientId={patientId} />

        {showCreateButton && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Record
          </Button>
        )}
      </div>
    </div>
  );
}
