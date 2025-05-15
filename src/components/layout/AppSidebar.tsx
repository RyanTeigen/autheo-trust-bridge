
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

import { 
  ClipboardCheck,
  Users,
  Database,
  FileCheck,
  Activity,
  Settings,
  Shield,
  Wallet
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.state === "collapsed";
  
  // Navigation link styling helper
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center p-2 w-full rounded-md ${
      isActive 
      ? 'bg-autheo-light text-autheo-primary font-medium' 
      : 'text-foreground hover:bg-muted/50'
    }`;
  };

  const adminItems = [
    { 
      title: "Dashboard", 
      path: "/", 
      icon: Activity 
    },
    { 
      title: "Compliance", 
      path: "/compliance", 
      icon: Shield 
    },
    { 
      title: "Audit Logs", 
      path: "/audit-logs", 
      icon: ClipboardCheck 
    }
  ];

  const patientItems = [
    { 
      title: "My Data", 
      path: "/my-data", 
      icon: Database 
    },
    { 
      title: "Smart Wallet", 
      path: "/wallet", 
      icon: Wallet 
    },
    { 
      title: "Shared Records", 
      path: "/shared-records", 
      icon: FileCheck 
    }
  ];

  const settingsItems = [
    { 
      title: "Users", 
      path: "/users", 
      icon: Users 
    },
    { 
      title: "Settings", 
      path: "/settings", 
      icon: Settings 
    }
  ];

  return (
    <Sidebar
      className={`border-r ${isCollapsed ? 'w-14' : 'w-60'}`}
      variant="sidebar"
    >
      <SidebarContent className="py-4">
        {/* Admin Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">
            {!isCollapsed && "Administration"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end className={getLinkClass}>
                      <item.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Patient Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">
            {!isCollapsed && "Patient Access"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getLinkClass}>
                      <item.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">
            {!isCollapsed && "System"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getLinkClass}>
                      <item.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
