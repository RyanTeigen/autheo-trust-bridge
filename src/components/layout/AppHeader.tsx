
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AutheoLogo from '@/components/ui/AutheoLogo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface AppHeaderProps {
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm z-10">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <AutheoLogo height={28} />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {children}
        <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
