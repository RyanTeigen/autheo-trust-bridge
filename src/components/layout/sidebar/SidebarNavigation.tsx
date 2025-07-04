
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
  FileText,
  Search,
  UserCheck,
  Stethoscope
} from 'lucide-react';

const SidebarNavigation: React.FC = () => {
  const { profile } = useAuth();
  
  const userRole = profile?.role || 'patient';
  const isProvider = userRole === 'provider';
  const isAdmin = userRole === 'admin' || userRole === 'supervisor';

  console.log('Sidebar Navigation - User role:', userRole);
  console.log('Sidebar Navigation - Is provider:', isProvider);

  // Allow provider access in development mode for debugging
  const showProviderPortal = isProvider || import.meta.env.DEV;

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

      {/* Provider Portal - Show as expandable section with all provider tools */}
      {showProviderPortal && (
        <ExpandableSidebarSection
          title="Provider Portal"
          description="Healthcare provider interface"
          icon={Stethoscope}
          subItems={providerPortalItems}
          defaultOpen={true}
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
