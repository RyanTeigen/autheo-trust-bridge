
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
  className?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ 
  onPatientSelect, 
  selectedPatient, 
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const searchPatients = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase
        .from('patients')
        .select('id, user_id, full_name, email, date_of_birth');

      // Search by name or email
      if (term.includes('@')) {
        query = query.ilike('email', `%${term}%`);
      } else {
        query = query.ilike('full_name', `%${term}%`);
      }

      const { data, error } = await query.limit(10);

      if (error) {
        throw error;
      }

      setSearchResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for patients",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPatients(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm(patient.full_name || patient.email);
    setShowResults(false);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    onPatientSelect(null as any);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-slate-200">Patient Search</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
            onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          />
          {selectedPatient && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
            >
              ×
            </Button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 bg-slate-700 border-slate-600 max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {searchResults.map((patient) => (
                <Button
                  key={patient.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left hover:bg-slate-600"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <User className="h-4 w-4 mr-3 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-200">
                      {patient.full_name || 'Unnamed Patient'}
                    </div>
                    <div className="text-sm text-slate-400">{patient.email}</div>
                    {patient.date_of_birth && (
                      <div className="text-xs text-slate-500">
                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-autheo-primary"></div>
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded border border-slate-600">
          <User className="h-4 w-4 text-green-400" />
          <span className="text-sm text-slate-200">
            Selected: {selectedPatient.full_name || selectedPatient.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
