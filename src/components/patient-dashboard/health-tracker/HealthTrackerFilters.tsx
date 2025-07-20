import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar, Activity } from 'lucide-react';

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  dataTypes: string[];
  source: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface HealthTrackerFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableDataTypes: string[];
  availableSources: string[];
}

const HealthTrackerFilters: React.FC<HealthTrackerFiltersProps> = ({
  filters,
  onFiltersChange,
  availableDataTypes,
  availableSources
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateDateRange = (field: 'start' | 'end', value: string) => {
    updateFilter('dateRange', {
      ...filters.dateRange,
      [field]: value
    });
  };

  const toggleDataType = (dataType: string) => {
    const updatedTypes = filters.dataTypes.includes(dataType)
      ? filters.dataTypes.filter(type => type !== dataType)
      : [...filters.dataTypes, dataType];
    
    updateFilter('dataTypes', updatedTypes);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      dataTypes: [],
      source: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.dataTypes.length > 0) count++;
    if (filters.source) count++;
    return count;
  };

  // Get quick date range options
  const getQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const setQuickDateRange = (days: number) => {
    updateFilter('dateRange', getQuickDateRange(days));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          {getActiveFilterCount() > 0 && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          
          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setQuickDateRange(7)}
              variant="outline"
              size="sm"
            >
              Last 7 days
            </Button>
            <Button
              onClick={() => setQuickDateRange(30)}
              variant="outline"
              size="sm"
            >
              Last 30 days
            </Button>
            <Button
              onClick={() => setQuickDateRange(90)}
              variant="outline"
              size="sm"
            >
              Last 3 months
            </Button>
            <Button
              onClick={() => setQuickDateRange(365)}
              variant="outline"
              size="sm"
            >
              Last year
            </Button>
          </div>
          
          {/* Custom Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="startDate" className="text-xs">From</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateDateRange('start', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs">To</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateDateRange('end', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Data Types Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Data Types
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableDataTypes.map((dataType) => (
              <Button
                key={dataType}
                onClick={() => toggleDataType(dataType)}
                variant={filters.dataTypes.includes(dataType) ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {dataType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
          
          {filters.dataTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.dataTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type.replace('_', ' ')}
                  <Button
                    onClick={() => toggleDataType(type)}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select
            value={filters.source}
            onValueChange={(value) => updateFilter('source', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All sources</SelectItem>
              {availableSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="value">Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: 'asc' | 'desc') => updateFilter('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {(filters.dateRange.start || filters.dateRange.end) && (
                <div>
                  Date: {filters.dateRange.start || 'Any'} to {filters.dateRange.end || 'Now'}
                </div>
              )}
              {filters.dataTypes.length > 0 && (
                <div>
                  Types: {filters.dataTypes.join(', ')}
                </div>
              )}
              {filters.source && (
                <div>
                  Source: {filters.source}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthTrackerFilters;