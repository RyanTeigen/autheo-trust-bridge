
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
  Settings,
  Shield,
  Wallet,
  BookOpen,
  Heart,
  CalendarIcon,
  LayoutDashboard
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.state === "collapsed";
  
  // Navigation link styling helper
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center p-2 w-full rounded-md ${
      isActive 
      ? 'bg-gradient-to-r from-autheo-primary/20 to-autheo-primary/10 text-autheo-primary font-medium' 
      : 'text-slate-300 hover:bg-slate-800/50 hover:text-autheo-primary/80'
    }`;
  };

  const patientItems = [
    {
      title: "Patient Dashboard",
      path: "/",
      icon: LayoutDashboard
    },
    {
      title: "Appointments",
      path: "/scheduling",
      icon: CalendarIcon
    }
  ];

  const providerItems = [
    { 
      title: "Patient Records", 
      path: "/patient-records", 
      icon: Database 
    },
    { 
      title: "Provider Portal", 
      path: "/provider-portal", 
      icon: Users 
    },
    { 
      title: "Medical Notes", 
      path: "/medical-notes", 
      icon: BookOpen 
    }
  ];

  const complianceItems = [
    { 
      title: "Compliance", 
      path: "/compliance", 
      icon: Shield 
    },
    { 
      title: "Audit Logs", 
      path: "/audit-logs", 
      icon: ClipboardCheck 
    },
    { 
      title: "Settings", 
      path: "/settings", 
      icon: Settings 
    }
  ];

  return (
    <Sidebar
      className={`border-r ${isCollapsed ? 'w-14' : 'w-60'} bg-slate-900/95 backdrop-blur-sm border-slate-800`}
      variant="sidebar"
    >
      <SidebarContent className="py-6">
        {/* Patient Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-autheo-primary/80">
            {!isCollapsed && "Patient Access"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end={item.path === "/"} className={getLinkClass}>
                      <item.icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Provider Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-autheo-primary/80">
            {!isCollapsed && "Provider Access"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {providerItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getLinkClass}>
                      <item.icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Compliance Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-autheo-primary/80">
            {!isCollapsed && "Compliance"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {complianceItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getLinkClass}>
                      <item.icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
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
