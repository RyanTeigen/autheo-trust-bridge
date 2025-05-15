
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock patient data
const mockPatients = [
  { id: "P12345", name: "John Doe", dob: "1980-05-15", mrn: "MR-123456" },
  { id: "P23456", name: "Jane Smith", dob: "1975-08-22", mrn: "MR-234567" },
  { id: "P34567", name: "Robert Johnson", dob: "1990-11-10", mrn: "MR-345678" },
  { id: "P45678", name: "Emily Wilson", dob: "1985-03-30", mrn: "MR-456789" },
  { id: "P56789", name: "Michael Brown", dob: "1968-07-17", mrn: "MR-567890" },
];

interface PatientSearchProps {
  onSelectPatient: (patientId: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof mockPatients>([]);
  const { toast } = useToast();
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    // In a real app, this would be an API call
    const query = searchQuery.toLowerCase();
    const results = mockPatients.filter(
      patient => 
        patient.name.toLowerCase().includes(query) || 
        patient.id.toLowerCase().includes(query) ||
        patient.mrn.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
    
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
    <div className="space-y-4">
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
      
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-2">
              {searchResults.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        DOB: {new Date(patient.dob).toLocaleDateString()} | MRN: {patient.mrn}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientSearch;
