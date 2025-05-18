
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters
}) => {
  return (
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
  );
};

export default SearchBar;
