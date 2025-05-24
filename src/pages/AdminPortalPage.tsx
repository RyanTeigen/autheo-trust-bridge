
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import UserManagementTab from '@/components/admin/UserManagementTab';
import ProviderManagementTab from '@/components/admin/ProviderManagementTab';
import SystemAdministrationTab from '@/components/admin/SystemAdministrationTab';
import ComplianceOversightTab from '@/components/admin/ComplianceOversightTab';
import { AdminPortalProvider, useAdminPortal } from '@/contexts/AdminPortalContext';

const AdminPortalContent: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const {
    activeTab,
    setActiveTab,
    systemAlerts,
    dismissAlert,
    userMetrics,
    systemHealth
  } = useAdminPortal();

  // Check if user has admin role
  const hasAdminRole = profile?.roles?.includes('admin') || profile?.roles?.includes('supervisor');

  if (!hasAdminRole) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            Access denied. This portal is restricted to administrators and supervisors only.
            You are currently viewing with creator privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader 
        alertCount={systemAlerts.length}
        systemHealth={systemHealth}
        userMetrics={userMetrics}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="providers">Provider Management</TabsTrigger>
          <TabsTrigger value="system">System Admin</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Oversight</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
        
        <TabsContent value="providers">
          <ProviderManagementTab />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemAdministrationTab />
        </TabsContent>
        
        <TabsContent value="compliance">
          <ComplianceOversightTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdminPortalPage: React.FC = () => {
  return (
    <AdminPortalProvider>
      <AdminPortalContent />
    </AdminPortalProvider>
  );
};

export default AdminPortalPage;
