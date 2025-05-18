
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import SearchBar from './patient-search/SearchBar';
import FilterPanel from './patient-search/FilterPanel';

export type PatientRecord = {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  lastVisit?: string;
  insuranceProvider?: string;
  primaryCareProvider?: string;
  tags?: string[];
};

export interface AdvancedPatientSearchProps {
  onSearch: (results: PatientRecord[]) => void;
  patients: PatientRecord[];
}

const AdvancedPatientSearch: React.FC<AdvancedPatientSearchProps> = ({
  onSearch,
  patients
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    insuranceProvider: '',
    visitDateFrom: '',
    visitDateTo: '',
    primaryCareProvider: '',
    tags: [] as string[]
  });
  
  const handleSearch = () => {
    let results = [...patients];
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply additional filters
    if (showFilters) {
      if (filters.insuranceProvider) {
        results = results.filter(patient => patient.insuranceProvider === filters.insuranceProvider);
      }
      
      if (filters.primaryCareProvider) {
        results = results.filter(patient => patient.primaryCareProvider === filters.primaryCareProvider);
      }
      
      if (filters.visitDateFrom) {
        results = results.filter(patient => 
          patient.lastVisit && new Date(patient.lastVisit) >= new Date(filters.visitDateFrom)
        );
      }
      
      if (filters.visitDateTo) {
        results = results.filter(patient => 
          patient.lastVisit && new Date(patient.lastVisit) <= new Date(filters.visitDateTo)
        );
      }
      
      if (filters.tags.length > 0) {
        results = results.filter(patient => 
          patient.tags && filters.tags.some(tag => patient.tags?.includes(tag))
        );
      }
    }
    
    onSearch(results);
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary">Advanced Patient Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
        
        {showFilters && (
          <FilterPanel 
            filters={filters}
            setFilters={setFilters}
            handleSearch={handleSearch}
          />
        )}
        
        {!showFilters && (
          <SearchButton onSearch={handleSearch} />
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedPatientSearch;
