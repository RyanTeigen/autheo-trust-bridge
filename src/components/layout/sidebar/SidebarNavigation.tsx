
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarMenu } from '@/components/ui/sidebar';
import SidebarNavItem from './SidebarNavItem';
import ExpandableSidebarSection from './ExpandableSidebarSection';
import {
  Heart,
  Users,
  Shield,
  FileSearch,
  Settings,
  Share2,
  FileText,
  Search,
  UserCheck
} from 'lucide-react';

const SidebarNavigation: React.FC = () => {
  const { profile } = useAuth();
  
  const userRoles = profile?.roles || ['patient'];
  const isProvider = userRoles.includes('provider');
  const isAdmin = userRoles.includes('admin') || userRoles.includes('supervisor');

  const providerPortalItems = [
    { to: '/provider-portal', icon: UserCheck, title: 'Dashboard' },
    { to: '/patient-records', icon: Search, title: 'Patient Records' },
    { to: '/medical-notes', icon: FileText, title: 'Medical Notes' }
  ];

  const complianceItems = [
    { to: '/compliance', icon: Shield, title: 'Overview' },
    { to: '/audit-logs', icon: FileSearch, title: 'Audit Logs' }
  ];

  return (
    <SidebarMenu>
      {/* Patient Dashboard - Always visible as default */}
      <SidebarNavItem
        to="/patient-dashboard"
        icon={Heart}
        title="My Health"
        description="Personal health dashboard"
      />

      {/* Shared Records - Visible to all authenticated users */}
      <SidebarNavItem
        to="/shared-records"
        icon={Share2}
        title="Shared Records"
        description="Records shared with you"
      />

      {/* Provider Portal - Expandable section for providers */}
      {isProvider && (
        <ExpandableSidebarSection
          title="Provider Portal"
          description="Healthcare provider interface"
          icon={Users}
          subItems={providerPortalItems}
        />
      )}

      {/* Admin Portal - Only visible to admins */}
      {isAdmin && (
        <SidebarNavItem
          to="/admin-portal"
          icon={Users}
          title="Admin Portal"
          description="Administrative interface"
        />
      )}

      {/* Compliance with nested Audit Logs */}
      <ExpandableSidebarSection
        title="Compliance"
        description="Regulatory compliance"
        icon={Shield}
        subItems={complianceItems}
      />

      <SidebarNavItem
        to="/settings"
        icon={Settings}
        title="Settings"
        description="Application preferences"
      />
    </SidebarMenu>
  );
};

export default SidebarNavigation;
