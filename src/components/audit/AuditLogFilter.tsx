
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface AuditLogFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

export const AuditLogFilter: React.FC<AuditLogFilterProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search audit logs..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Events" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="access">Access Events</SelectItem>
          <SelectItem value="disclosure">Disclosures</SelectItem>
          <SelectItem value="breach">Security Events</SelectItem>
          <SelectItem value="admin">Admin Actions</SelectItem>
          <SelectItem value="amendment">Amendments</SelectItem>
          <SelectItem value="login">Login Events</SelectItem>
          <SelectItem value="logout">Logout Events</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AuditLogFilter;
