
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
      <SidebarHeader className="p-4 border-b border-border bg-background/50">
        <div className="flex items-center justify-between">
          {!collapsed && !isFullscreen && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Navigation</span>
              <span className="text-xs text-muted-foreground">Healthcare Portal</span>
            </div>
          )}
          {isFullscreenSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreenToggle}
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted",
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
        <SidebarFooter className="p-3 border-t border-border bg-background/50">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreenToggle}
              className={cn(
                "text-xs gap-2 w-full transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-sm"
              )}
            >
              <Monitor className="h-3 w-3" />
              {!isFullscreen && !collapsed && (
                <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}</span>
              )}
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
