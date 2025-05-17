
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface WalletFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'date' | 'provider' | 'category';
  setSortBy: (sortBy: 'date' | 'provider' | 'category') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  categories: string[];
}

const WalletFilters: React.FC<WalletFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  categories
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 bg-slate-50 p-2 rounded-lg">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search records..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 border-slate-200 bg-white h-8 text-sm"
        />
      </div>
      
      <div className="flex gap-1.5 flex-wrap md:flex-nowrap">
        <Select 
          value={selectedCategory} 
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-[150px] bg-white border-slate-200 h-8 text-sm">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category} className="text-sm">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={sortBy} 
          onValueChange={(value: 'date' | 'provider' | 'category') => setSortBy(value)}
        >
          <SelectTrigger className="w-[130px] bg-white border-slate-200 h-8 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date" className="text-sm">Sort by Date</SelectItem>
            <SelectItem value="provider" className="text-sm">Sort by Provider</SelectItem>
            <SelectItem value="category" className="text-sm">Sort by Category</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="bg-white border-slate-200 h-8 w-8 p-0"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
    </div>
  );
};

export default WalletFilters;
