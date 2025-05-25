import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Home,
  User,
  FileText,
  Wallet,
  Share2,
  Calendar,
  Settings,
  Activity,
  Building2,
  Shield,
  Stethoscope,
  Users,
  ClipboardList,
  UserCheck,
  Brain,
  LineChart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AutheoLogo from '@/components/ui/AutheoLogo';

const AppSidebar = () => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
      {
        title: "Patient Dashboard", 
        url: "/patient-dashboard",
        icon: User,
      },
      {
        title: "Smart Forms",
        url: "/smart-forms",
        icon: Brain,
      },
      {
        title: "Health Records",
        url: "/health-records", 
        icon: FileText,
      },
      {
        title: "Smart Wallet",
        url: "/wallet",
        icon: Wallet,
      },
      {
        title: "Shared Records",
        url: "/shared-records",
        icon: Share2,
      },
      {
        title: "Scheduling",
        url: "/scheduling",
        icon: Calendar,
      },
      {
        title: "Health Tracker",
        url: "/health-tracker",
        icon: Activity,
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
      {
        title: "Provider Access",
        url: "/provider-access",
        icon: UserCheck,
      },
       {
        title: "Medical Notes",
        url: "/medical-notes",
        icon: ClipboardList,
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

    if (user?.roles?.includes('provider')) {
      baseItems.push(...providerItems);
    }

    if (user?.roles?.includes('admin')) {
      baseItems.push(...adminItems);
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar className="bg-slate-900 border-r border-slate-800 text-slate-400 w-64">
        <SidebarTrigger asChild>
          <SidebarMenuButton className="ml-2 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100" />
        </SidebarTrigger>
        <SidebarContent>
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel>Autheo</SidebarGroupLabel>
            <SidebarGroupContent>
              <AutheoLogo className="h-8 w-auto" />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem
                key={item.title}
                href={item.url}
                active={location.pathname === item.url}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default AppSidebar;
