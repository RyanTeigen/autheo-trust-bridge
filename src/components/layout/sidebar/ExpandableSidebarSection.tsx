
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  description?: string;
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
          "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
          isCompact ? "justify-center px-2 py-3" : "space-x-3 px-3 py-2.5",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
          "hover:scale-[1.02] hover:shadow-sm",
          isOpen && "bg-muted/50"
        )}
        title={isCompact ? `${title} - ${description}` : undefined}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", isCompact && "mx-auto")} />
        {!isCompact && (
          <>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-medium truncate">{title}</span>
              <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 truncate">
                {description}
              </span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180")} />
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
                      "flex items-center space-x-2 rounded-lg text-sm transition-all duration-200 px-3 py-2 ml-2",
                      isActive
                        ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      "hover:scale-[1.02] hover:shadow-sm"
                    )
                  }
                  onClick={() => toggleSidebar()}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground ml-auto truncate hidden sm:block">
                      {item.description}
                    </span>
                  )}
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
