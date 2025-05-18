
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import NotificationBanner from '@/components/provider/NotificationBanner';
import PortalHeader from '@/components/provider-portal/PortalHeader';
import ProviderDashboardTab from '@/components/provider-portal/ProviderDashboardTab';
import PatientsTab from '@/components/provider-portal/PatientsTab';
import MessagingTab from '@/components/provider-portal/MessagingTab';
import AccessRequestTab from '@/components/provider-portal/AccessRequestTab';
import ScheduleTab from '@/components/provider-portal/ScheduleTab';
import { ProviderPortalProvider, useProviderPortal } from '@/contexts/ProviderPortalContext';

const ProviderPortalContent: React.FC = () => {
  const { toast } = useToast();
  const {
    activeTab,
    setActiveTab,
    notifications,
    dismissNotification,
    metrics,
    appointments,
    recentPatients,
    patientRecords
  } = useProviderPortal();

  const handleDismissNotification = (id: string) => {
    dismissNotification(id);
    toast({
      title: "Notification Dismissed",
      description: "The notification has been removed from your list.",
    });
  };

  return (
    <div className="space-y-6">
      <PortalHeader notificationCount={notifications.length} />
      
      <NotificationBanner
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="patients">Patient Records</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="access">Request Access</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <ProviderDashboardTab
            metrics={metrics}
            appointments={appointments}
            recentPatients={recentPatients}
          />
        </TabsContent>
        
        <TabsContent value="patients">
          <PatientsTab patientRecords={patientRecords} />
        </TabsContent>
        
        <TabsContent value="messaging">
          <MessagingTab />
        </TabsContent>
        
        <TabsContent value="access">
          <AccessRequestTab />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleTab appointments={appointments} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Wrap the component with the context provider
const ProviderPortalPage: React.FC = () => {
  return (
    <ProviderPortalProvider>
      <ProviderPortalContent />
    </ProviderPortalProvider>
  );
};

export default ProviderPortalPage;
