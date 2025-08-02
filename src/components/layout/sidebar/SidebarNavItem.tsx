
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon: Icon, title, description }) => {
  const { toggleSidebar, state } = useSidebar();
  const { isFullscreen } = useFullscreen();
  const collapsed = state === 'collapsed';
  const isCompact = collapsed || isFullscreen;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={to}
          className={({ isActive }) =>
            cn(
              "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative",
              isCompact ? "justify-center px-2 py-3" : "space-x-3 px-3 py-2.5",
              isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              "hover:scale-[1.02] hover:shadow-sm"
            )
          }
          onClick={() => toggleSidebar()}
          title={isCompact ? `${title} - ${description}` : undefined}
        >
          <Icon className={cn("h-4 w-4 flex-shrink-0", isCompact && "mx-auto")} />
          {!isCompact && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium truncate">{title}</span>
              <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 truncate">
                {description}
              </span>
            </div>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarNavItem;
