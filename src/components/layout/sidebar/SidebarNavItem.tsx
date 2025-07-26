
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
              "group flex items-center rounded-md text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
              isCompact ? "justify-center px-2 py-3" : "space-x-3 px-3 py-2",
              isActive
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400"
            )
          }
          onClick={() => toggleSidebar()}
          title={isCompact ? `${title} - ${description}` : undefined}
        >
          <Icon className={cn("h-4 w-4", isCompact && "mx-auto")} />
          {!isCompact && (
            <div className="flex flex-col">
              <span>{title}</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-400">{description}</span>
            </div>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarNavItem;
