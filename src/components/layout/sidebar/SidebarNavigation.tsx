
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarMenu, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import SidebarNavItem from './SidebarNavItem';
import ExpandableSidebarSection from './ExpandableSidebarSection';
import {
  Heart,
  Users,
  Shield,
  FileSearch,
  Settings,
  FileText,
  Search,
  UserCheck,
  Stethoscope,
  Home,
  Calendar,
  MessageSquare,
  Bell,
  HelpCircle,
  Activity,
  Database,
  Lock,
  BarChart3,
  SearchIcon,
} from 'lucide-react';

const SidebarNavigation: React.FC = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const userRole = profile?.role || 'patient';
  const userRoles = profile?.roles || [userRole];
  const isProvider = userRoles.includes('provider');
  const isAdmin = userRoles.includes('admin') || userRoles.includes('supervisor');

  // Core navigation structure
  const coreItems = [
    { to: '/patient-dashboard', icon: Heart, title: 'My Health', description: 'Personal health dashboard', roles: ['patient', 'provider', 'admin'] },
    { to: '/appointments', icon: Calendar, title: 'Appointments', description: 'Schedule and manage appointments', roles: ['patient', 'provider'] },
    { to: '/messages', icon: MessageSquare, title: 'Messages', description: 'Secure communication', roles: ['patient', 'provider'] },
    { to: '/notifications', icon: Bell, title: 'Notifications', description: 'Important updates', roles: ['patient', 'provider', 'admin'] },
  ];

  const providerPortalItems = [
    { to: '/provider-portal', icon: UserCheck, title: 'Dashboard', description: 'Provider overview' },
    { to: '/patient-records', icon: Search, title: 'Patient Records', description: 'Search and manage patients' },
    { to: '/medical-notes', icon: FileText, title: 'Medical Notes', description: 'Clinical documentation' },
    { to: '/analytics', icon: BarChart3, title: 'Analytics', description: 'Performance insights' }
  ];

  const adminPortalItems = [
    { to: '/admin-portal', icon: Users, title: 'User Management', description: 'Manage users and permissions' },
    { to: '/system-settings', icon: Settings, title: 'System Settings', description: 'Configure system preferences' },
    { to: '/audit-reports', icon: FileSearch, title: 'Audit Reports', description: 'System audit and reporting' }
  ];

  const complianceItems = [
    { to: '/compliance', icon: Shield, title: 'Overview', description: 'Compliance dashboard' },
    { to: '/audit-logs', icon: FileSearch, title: 'Audit Logs', description: 'System activity logs' },
    { to: '/security-dashboard', icon: Lock, title: 'Security', description: 'Security monitoring' },
    { to: '/quantum-security', icon: Database, title: 'Quantum Security', description: 'Advanced encryption' }
  ];

  const supportItems = [
    { to: '/help', icon: HelpCircle, title: 'Help Center', description: 'Documentation and support', roles: ['patient', 'provider', 'admin'] },
    { to: '/settings', icon: Settings, title: 'Settings', description: 'Account preferences', roles: ['patient', 'provider', 'admin'] }
  ];

  // Filter items based on search and role access
  const filteredCoreItems = useMemo(() => 
    coreItems.filter(item => 
      item.roles.some(role => userRoles.includes(role)) &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [searchQuery, userRoles]
  );

  const filteredSupportItems = useMemo(() => 
    supportItems.filter(item => 
      item.roles.some(role => userRoles.includes(role)) &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [searchQuery, userRoles]
  );

  const hasRoleAccess = (requiredRoles: string[]) => {
    return requiredRoles.some(role => userRoles.includes(role));
  };

  return (
    <div className="space-y-2">
      {/* Search functionality */}
      <div className="px-3 py-2">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-background/50 border-muted"
          />
        </div>
      </div>

      <SidebarMenu>
        {/* Core Navigation */}
        {filteredCoreItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
              Essential
            </SidebarGroupLabel>
            {filteredCoreItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </SidebarGroup>
        )}

        {/* Provider Portal - Show if user has provider access */}
        {hasRoleAccess(['provider', 'admin']) && (
          <ExpandableSidebarSection
            title="Provider Portal"
            description="Healthcare provider tools"
            icon={Stethoscope}
            subItems={providerPortalItems}
            defaultOpen={isProvider}
          />
        )}

        {/* Admin Portal - Only visible to admins */}
        {hasRoleAccess(['admin', 'supervisor']) && (
          <ExpandableSidebarSection
            title="Administration"
            description="System administration"
            icon={Users}
            subItems={adminPortalItems}
            defaultOpen={isAdmin}
          />
        )}

        {/* Compliance - Always visible but content varies by role */}
        <ExpandableSidebarSection
          title="Compliance & Security"
          description="Regulatory compliance and security"
          icon={Shield}
          subItems={complianceItems}
          defaultOpen={false}
        />

        {/* Support & Settings */}
        {filteredSupportItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
              Support
            </SidebarGroupLabel>
            {filteredSupportItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </SidebarGroup>
        )}
      </SidebarMenu>
    </div>
  );
};

export default SidebarNavigation;
