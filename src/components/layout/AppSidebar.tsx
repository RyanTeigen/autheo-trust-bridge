
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, Monitor } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import SidebarNavigation from './sidebar/SidebarNavigation';

const AppSidebar: React.FC = () => {
  const { isFullscreen, isFullscreenSupported, toggleFullscreen } = useFullscreen();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleFullscreenToggle = () => {
    toggleFullscreen();
  };

  return (
    <Sidebar className={cn("transition-all duration-300", isFullscreen ? "w-16" : "w-64")}>
      <SidebarHeader className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && !isFullscreen && (
            <span className="text-sm font-medium text-slate-400">Navigation</span>
          )}
          {isFullscreenSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreenToggle}
              className={cn(
                "h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800",
                isFullscreen && "mx-auto"
              )}
              title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className={cn("transition-all duration-300", isFullscreen && "px-1")}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarNavigation />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {isFullscreenSupported && (
        <SidebarFooter className="p-2 border-t border-slate-800">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreenToggle}
              className={cn(
                "text-xs gap-2 bg-slate-800/50 border-slate-700 hover:bg-slate-700",
                isFullscreen ? "w-full" : "w-full"
              )}
            >
              <Monitor className="h-3 w-3" />
              {!isFullscreen && !collapsed && (
                <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
              )}
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
