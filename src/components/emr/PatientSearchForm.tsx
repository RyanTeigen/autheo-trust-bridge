
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  name: string;
  dob: string;
  mrn: string;
}

interface PatientSearchFormProps {
  onSearch: (results: Patient[]) => void;
  patients: Patient[];
}

const PatientSearchForm: React.FC<PatientSearchFormProps> = ({ onSearch, patients }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      onSearch([]);
      return;
    }
    
    // In a real app, this would be an API call
    const query = searchQuery.toLowerCase();
    const results = patients.filter(
      patient => 
        patient.name.toLowerCase().includes(query) || 
        patient.id.toLowerCase().includes(query) ||
        patient.mrn.toLowerCase().includes(query)
    );
    
    onSearch(results);
    
    if (results.length === 0) {
      toast({
        title: "No patients found",
        description: "Try a different search term",
      });
    }
  };
  
  const handleCreateNewPatient = () => {
    toast({
      title: "Create Patient",
      description: "This feature is coming soon",
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, ID, or MRN..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
      </div>
      <Button onClick={handleSearch}>Search</Button>
      <Button variant="outline" onClick={handleCreateNewPatient}>
        <UserPlus className="h-4 w-4 mr-2" />
        New Patient
      </Button>
    </div>
  );
};

export default PatientSearchForm;
