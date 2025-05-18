
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

const UserProfileMenu: React.FC = () => {
  const { profile, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

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
            <p className="text-sm font-medium leading-none">{profile?.firstName} {profile?.lastName}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Roles</DropdownMenuLabel>
          {hasRole('patient') && (
            <DropdownMenuItem onClick={() => navigate('/')}>
              <User className="mr-2 h-4 w-4" />
              <span>Patient Portal</span>
            </DropdownMenuItem>
          )}
          {hasRole('provider') && (
            <DropdownMenuItem onClick={() => navigate('/provider-portal')}>
              <Stethoscope className="mr-2 h-4 w-4" />
              <span>Provider Portal</span>
            </DropdownMenuItem>
          )}
          {hasRole('compliance') && (
            <DropdownMenuItem onClick={() => navigate('/compliance')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Compliance Portal</span>
            </DropdownMenuItem>
          )}
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
