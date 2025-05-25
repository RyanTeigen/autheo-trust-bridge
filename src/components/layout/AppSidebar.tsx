
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  User,
  Settings,
  Building2,
  Shield,
  Stethoscope,
  Users,
  Brain,
  LineChart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AutheoLogo from '@/components/ui/AutheoLogo';

const AppSidebar = () => {
  const { profile } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Patient Access", 
        url: "/",
        icon: User,
      },
      {
        title: "Smart Forms",
        url: "/smart-forms",
        icon: Brain,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ];

    const providerItems = [
      {
        title: "Provider Portal",
        url: "/provider-portal",
        icon: Building2,
      },
      {
        title: "Patient Records",
        url: "/patient-records",
        icon: Users,
      },
    ];

    const adminItems = [
      {
        title: "Admin Portal",
        url: "/admin-portal",
        icon: Shield,
      },
      {
        title: "Compliance",
        url: "/compliance",
        icon: Stethoscope,
      },
      {
        title: "Audit Logs",
        url: "/audit-logs",
        icon: LineChart,
      },
    ];

    if (profile?.roles?.includes('provider')) {
      baseItems.push(...providerItems);
    }

    if (profile?.roles?.includes('admin')) {
      baseItems.push(...adminItems);
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const location = useLocation();

  return (
    <Sidebar className="bg-slate-900 border-r border-slate-800 text-slate-400 w-64">
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel>Autheo</SidebarGroupLabel>
          <SidebarGroupContent>
            <AutheoLogo className="h-8 w-auto" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <Link to={item.url} className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
