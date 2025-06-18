
import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MedicalRecordsControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
  onCreateRecord: () => void;
}

const MedicalRecordsControls: React.FC<MedicalRecordsControlsProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  onCreateRecord
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medical records..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={onFilterChange}>
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
      <Button onClick={onCreateRecord}>
        <Plus className="h-4 w-4 mr-2" />
        Add Record
      </Button>
    </div>
  );
};

export default MedicalRecordsControls;
