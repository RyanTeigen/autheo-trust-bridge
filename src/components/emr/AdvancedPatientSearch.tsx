
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

interface AdvancedPatientSearchProps {
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
  
  const insuranceProviders = ['BlueCross', 'Aetna', 'UnitedHealth', 'Medicare', 'Cigna'];
  const providers = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
  const availableTags = ['High Risk', 'Follow-up Required', 'New Patient', 'Chronic Condition', 'Specialist Referral'];
  
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
  
  const clearFilters = () => {
    setFilters({
      insuranceProvider: '',
      visitDateFrom: '',
      visitDateTo: '',
      primaryCareProvider: '',
      tags: []
    });
  };
  
  const toggleTag = (tag: string) => {
    setFilters(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary">Advanced Patient Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, MRN, or DOB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100"
            />
          </div>
          <Button 
            variant="outline"
            className="border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="p-4 border border-slate-700 rounded-md bg-slate-800/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Insurance Provider</label>
                <Select 
                  value={filters.insuranceProvider} 
                  onValueChange={(value) => setFilters({...filters, insuranceProvider: value})}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All Providers</SelectItem>
                      {insuranceProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Primary Care Provider</label>
                <Select 
                  value={filters.primaryCareProvider} 
                  onValueChange={(value) => setFilters({...filters, primaryCareProvider: value})}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All Providers</SelectItem>
                      {providers.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Visit Date From</label>
                <Input
                  type="date"
                  value={filters.visitDateFrom}
                  onChange={(e) => setFilters({...filters, visitDateFrom: e.target.value})}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Visit Date To</label>
                <Input
                  type="date"
                  value={filters.visitDateTo}
                  onChange={(e) => setFilters({...filters, visitDateTo: e.target.value})}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Patient Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      filters.tags.includes(tag) 
                        ? 'bg-autheo-primary text-slate-900' 
                        : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-slate-400"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button 
                onClick={handleSearch}
                className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        )}
        
        {!showFilters && (
          <Button 
            onClick={handleSearch}
            className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedPatientSearch;
