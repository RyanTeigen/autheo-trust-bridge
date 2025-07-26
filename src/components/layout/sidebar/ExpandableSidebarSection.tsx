
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton 
} from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';

interface SubMenuItem {
  to: string;
  icon: LucideIcon;
  title: string;
}

interface ExpandableSidebarSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  subItems: SubMenuItem[];
  defaultOpen?: boolean;
}

const ExpandableSidebarSection: React.FC<ExpandableSidebarSectionProps> = ({
  title,
  description,
  icon: Icon,
  subItems,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { toggleSidebar, state } = useSidebar();
  const { isFullscreen } = useFullscreen();
  const collapsed = state === 'collapsed';
  const isCompact = collapsed || isFullscreen;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center rounded-md text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200 text-slate-400 cursor-pointer",
          isCompact ? "justify-center px-2 py-3" : "space-x-3 px-3 py-2"
        )}
        title={isCompact ? `${title} - ${description}` : undefined}
      >
        <Icon className={cn("h-4 w-4", isCompact && "mx-auto")} />
        {!isCompact && (
          <>
            <div className="flex flex-col flex-1">
              <span>{title}</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-400">{description}</span>
            </div>
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
          </>
        )}
      </SidebarMenuButton>
      {isOpen && !isCompact && (
        <SidebarMenuSub>
          {subItems.map((item) => (
            <SidebarMenuSubItem key={item.to}>
              <SidebarMenuSubButton asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
                      isActive
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-400"
                    )
                  }
                  onClick={() => toggleSidebar()}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export default ExpandableSidebarSection;
