
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface EnhancedHealthRecordsFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  dateRange: { start: string | null; end: string | null };
  setDateRange: (range: { start: string | null; end: string | null }) => void;
  sharedFilter: 'all' | 'shared' | 'private';
  setSharedFilter: (filter: 'all' | 'shared' | 'private') => void;
  providers: string[];
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
}

const EnhancedHealthRecordsFilter: React.FC<EnhancedHealthRecordsFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  dateRange,
  setDateRange,
  sharedFilter,
  setSharedFilter,
  providers,
  selectedProvider,
  setSelectedProvider
}) => {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const activeFiltersCount = [
    selectedCategory !== 'all',
    dateRange.start || dateRange.end,
    sharedFilter !== 'all',
    selectedProvider !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setDateRange({ start: null, end: null });
    setSharedFilter('all');
    setSelectedProvider('all');
  };

  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search health records..."
            className="pl-9 pr-4 py-2 w-full bg-slate-900/50 border-slate-700 text-slate-100 focus-visible:ring-autheo-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[130px] bg-slate-900/50 border-slate-700 text-slate-100 h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-sm focus:bg-slate-700">
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-700"
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge 
                className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-autheo-primary text-slate-900"
              >
                {activeFiltersCount}
              </Badge>
            )}
            {isAdvancedFiltersOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      <Collapsible
        open={isAdvancedFiltersOpen}
        onOpenChange={setIsAdvancedFiltersOpen}
        className="transition-all duration-200"
      >
        <CollapsibleContent className="pt-3 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Date Range</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-slate-100 h-8 text-sm"
                />
                <span className="text-slate-400">to</span>
                <Input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-slate-100 h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Sharing Status</label>
              <Select value={sharedFilter} onValueChange={(value: 'all' | 'shared' | 'private') => setSharedFilter(value)}>
                <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-slate-100 h-8 text-sm">
                  <SelectValue placeholder="Filter by sharing status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectItem value="all" className="text-sm focus:bg-slate-700">All Records</SelectItem>
                  <SelectItem value="shared" className="text-sm focus:bg-slate-700">Shared Only</SelectItem>
                  <SelectItem value="private" className="text-sm focus:bg-slate-700">Private Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-slate-100 h-8 text-sm">
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectItem value="all" className="text-sm focus:bg-slate-700">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider} className="text-sm focus:bg-slate-700">
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="text-sm text-slate-300 hover:bg-slate-700/50"
            >
              Clear All Filters
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EnhancedHealthRecordsFilter;
