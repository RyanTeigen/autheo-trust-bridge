
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortalHeader from '@/components/provider-portal/PortalHeader';
import ProviderDashboardTab from '@/components/provider-portal/ProviderDashboardTab';
import ConsolidatedPatientRecordsTab from '@/components/provider-portal/ConsolidatedPatientRecordsTab';
import MessagingTab from '@/components/provider-portal/MessagingTab';
import ScheduleTab from '@/components/provider-portal/ScheduleTab';
import PrescriptionManagement from '@/components/provider/PrescriptionManagement';
import { ProviderPortalProvider, useProviderPortal } from '@/contexts/ProviderPortalContext';

const ProviderPortalContent: React.FC = () => {
  console.log('ProviderPortalContent rendering...');
  
  const {
    activeTab,
    setActiveTab,
    metrics,
    appointments,
    recentPatients
  } = useProviderPortal();

  console.log('ProviderPortal data:', { 
    activeTab, 
    metricsLoaded: !!metrics,
    appointmentsCount: appointments.length,
    recentPatientsCount: recentPatients.length
  });

  try {
    return (
      <div className="space-y-6 bg-slate-900 text-slate-100 min-h-screen p-6">
        <PortalHeader notificationCount={0} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="dashboard" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">Dashboard</TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">Prescriptions</TabsTrigger>
            <TabsTrigger value="patient-records" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">Patient Records</TabsTrigger>
            <TabsTrigger value="messaging" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">Messaging</TabsTrigger>
            <TabsTrigger value="schedule" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <ProviderDashboardTab />
          </TabsContent>
          
          <TabsContent value="prescriptions" className="mt-6">
            <PrescriptionManagement />
          </TabsContent>
          
          <TabsContent value="patient-records" className="mt-6">
            <ConsolidatedPatientRecordsTab />
          </TabsContent>
          
          <TabsContent value="messaging" className="mt-6">
            <MessagingTab />
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6">
            <ScheduleTab appointments={appointments} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Error in ProviderPortalContent:', error);
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400">Error Loading Provider Portal</h2>
          <p className="text-slate-400 mt-2">Please check the console for details.</p>
          <p className="text-sm text-slate-500 mt-4">{error?.toString()}</p>
        </div>
      </div>
    );
  }
};

// Wrap the component with the context provider
const ProviderPortalPage: React.FC = () => {
  console.log('ProviderPortalPage rendering...');
  
  try {
    return (
      <div className="dark bg-slate-900 text-slate-100 min-h-screen">
        <ProviderPortalProvider>
          <ProviderPortalContent />
        </ProviderPortalProvider>
      </div>
    );
  } catch (error) {
    console.error('Error in ProviderPortalPage:', error);
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">Provider Portal Error</h1>
          <p className="text-slate-400 mt-2">Failed to load the provider portal.</p>
          <p className="text-sm text-slate-500 mt-4">{error?.toString()}</p>
        </div>
      </div>
    );
  }
};

export default ProviderPortalPage;
