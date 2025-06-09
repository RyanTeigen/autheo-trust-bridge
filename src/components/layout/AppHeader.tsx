
import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AutheoLogo from '@/components/ui/AutheoLogo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <header className={cn(
      "flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm z-10 transition-all duration-300",
      isMinimized ? "h-8" : "h-16"
    )}>
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        {!isMinimized && (
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <AutheoLogo className="h-7 w-auto" />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isMinimized && children}
        
        {!isMinimized && (
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size={isMinimized ? "sm" : "icon"}
          onClick={toggleMinimize}
          className="flex items-center gap-1"
        >
          {isMinimized ? (
            <>
              <ChevronDown className="h-3 w-3" />
              <span className="text-xs">Show</span>
            </>
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
};
