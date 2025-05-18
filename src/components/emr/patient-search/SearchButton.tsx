
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  onSearch: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onSearch }) => {
  return (
    <Button 
      onClick={onSearch}
      className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
    >
      <Search className="h-4 w-4 mr-2" />
      Search
    </Button>
  );
};

export default SearchButton;
