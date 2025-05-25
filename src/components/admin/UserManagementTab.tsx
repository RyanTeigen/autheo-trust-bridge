
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserTable from './user-management/UserTable';
import CreateUserDialog from './user-management/CreateUserDialog';
import UserFilters from './user-management/UserFilters';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'provider' | 'admin' | 'supervisor';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  created: string;
}

const UserManagementTab: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // Mock user data
  const users: User[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      role: 'provider',
      status: 'active',
      lastLogin: '2 hours ago',
      created: '2024-01-15'
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'patient',
      status: 'active',
      lastLogin: '1 day ago',
      created: '2024-03-22'
    },
    {
      id: '3',
      name: 'IT Administrator',
      email: 'admin@hospital.com',
      role: 'admin',
      status: 'active',
      lastLogin: '30 minutes ago',
      created: '2024-01-01'
    },
    {
      id: '4',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@hospital.com',
      role: 'supervisor',
      status: 'active',
      lastLogin: '4 hours ago',
      created: '2024-02-10'
    }
  ];

  const handleCreateUser = () => {
    toast({
      title: "User Created",
      description: "New user has been successfully created and invited.",
    });
    setIsCreateUserOpen(false);
  };

  const handleEditUser = (userId: string) => {
    toast({
      title: "Edit User",
      description: `Opening edit dialog for user ${userId}`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    toast({
      title: "User Deleted",
      description: "User has been removed from the system.",
      variant: "destructive",
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <UserFilters
                searchQuery={searchQuery}
                selectedRole={selectedRole}
                onSearchChange={setSearchQuery}
                onRoleChange={setSelectedRole}
              />
            </div>
            <CreateUserDialog
              isOpen={isCreateUserOpen}
              onOpenChange={setIsCreateUserOpen}
              onCreateUser={handleCreateUser}
            />
          </div>

          <UserTable
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementTab;
