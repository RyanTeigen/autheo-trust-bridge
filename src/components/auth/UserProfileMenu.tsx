
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
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings, User, Shield, Stethoscope, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UserProfileMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Determine available portals based on user role
  const availablePortals = [
    { role: 'patient', label: 'Patient Portal', icon: User, path: '/' },
    { role: 'provider', label: 'Provider Portal', icon: Stethoscope, path: '/provider-portal' },
    { role: 'admin', label: 'Admin Portal', icon: Shield, path: '/admin-portal' },
    { role: 'supervisor', label: 'Admin Portal', icon: Shield, path: '/admin-portal' },
  ];

  const userRoles = profile?.roles || ['patient'];
  const visiblePortals = availablePortals.filter(portal => 
    userRoles.includes(portal.role) || portal.role === 'patient' // Always show patient portal
  );

  const displayName = profile?.firstName || user?.email || 'User';
  const primaryRole = userRoles[0] || 'patient';

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
              {displayName}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[0.65rem] h-4 px-1 py-0">
                {primaryRole}
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
