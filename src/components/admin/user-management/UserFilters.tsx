
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchQuery: string;
  selectedRole: string;
  onSearchChange: (query: string) => void;
  onRoleChange: (role: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  selectedRole,
  onSearchChange,
  onRoleChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="supervisor">Supervisor</SelectItem>
          <SelectItem value="provider">Provider</SelectItem>
          <SelectItem value="patient">Patient</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserFilters;
