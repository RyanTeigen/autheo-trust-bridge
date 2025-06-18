
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';
import { LogOut, Settings, User, Shield, Stethoscope, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UserProfileMenu: React.FC = () => {
  const { user, logout } = useFrontendAuth();
  const navigate = useNavigate();
  
  const getInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleSignOut = async () => {
    logout();
    navigate('/auth');
  };

  // Determine available portals based on user role
  const availablePortals = [
    { role: 'patient', label: 'Patient Portal', icon: User, path: '/' },
    { role: 'provider', label: 'Provider Portal', icon: Stethoscope, path: '/provider-portal' },
    { role: 'admin', label: 'Admin Portal', icon: Shield, path: '/admin-portal' },
    { role: 'supervisor', label: 'Admin Portal', icon: Shield, path: '/admin-portal' },
  ];

  const visiblePortals = availablePortals.filter(portal => 
    portal.role === user?.role || portal.role === 'patient' // Always show patient portal
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-autheo-primary/10 text-autheo-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.username}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[0.65rem] h-4 px-1 py-0">
                {user?.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel>Portals</DropdownMenuLabel>
          {visiblePortals.map((portal) => (
            <DropdownMenuItem key={portal.path} onClick={() => navigate(portal.path)}>
              <portal.icon className="mr-2 h-4 w-4" />
              <span>{portal.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/wallet')}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>My Wallet</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
