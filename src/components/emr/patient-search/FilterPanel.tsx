
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PatientTagsSelector from './PatientTagsSelector';

// Constants for select options
const insuranceProviders = ['BlueCross', 'Aetna', 'UnitedHealth', 'Medicare', 'Cigna'];
const providers = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
const availableTags = ['High Risk', 'Follow-up Required', 'New Patient', 'Chronic Condition', 'Specialist Referral'];

interface Filters {
  insuranceProvider: string;
  visitDateFrom: string;
  visitDateTo: string;
  primaryCareProvider: string;
  tags: string[];
}

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  handleSearch: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  handleSearch
}) => {
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
      
      <PatientTagsSelector 
        selectedTags={filters.tags}
        availableTags={availableTags}
        toggleTag={toggleTag}
      />
      
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
  );
};

export default FilterPanel;
