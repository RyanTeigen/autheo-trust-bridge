
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PatientSearch from '@/components/emr/PatientSearch';
import ProviderDashboard from '@/components/provider/ProviderDashboard';
import ProviderSchedule from '@/components/provider/ProviderSchedule';
import PageHeader from '@/components/dashboard/PageHeader';
import ProviderMessaging from '@/components/provider/ProviderMessaging';
import ProviderAccessRequest from '@/components/provider-access/ProviderAccessRequest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Shield, Database } from 'lucide-react';

// Mock data for scheduled appointments
const mockAppointments = [
  { id: 'A1', patientName: 'John Doe', time: '09:00 AM', type: 'Follow-up', status: 'Checked In' },
  { id: 'A2', patientName: 'Jane Smith', time: '10:30 AM', type: 'New Patient', status: 'Scheduled' },
  { id: 'A3', patientName: 'Robert Johnson', time: '11:45 AM', type: 'Lab Results', status: 'Scheduled' },
  { id: 'A4', patientName: 'Emily Wilson', time: '01:15 PM', type: 'Annual Physical', status: 'Scheduled' },
  { id: 'A5', patientName: 'Michael Brown', time: '02:30 PM', type: 'Follow-up', status: 'Scheduled' },
];

// Mock data for recent patients
const mockRecentPatients = [
  { id: 'P12345', name: 'John Doe', lastVisit: '2025-05-10', reason: 'Follow-up' },
  { id: 'P23456', name: 'Jane Smith', lastVisit: '2025-05-08', reason: 'New Patient' },
  { id: 'P34567', name: 'Robert Johnson', lastVisit: '2025-05-05', reason: 'Lab Results' },
];

const ProviderPortalPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAction = () => {
    toast({
      title: "Feature in Development",
      description: "This provider feature will be available soon.",
    });
  };

  const handleSelectPatient = (patientId: string) => {
    toast({
      title: "Patient Selected",
      description: `Navigating to patient record: ${patientId}`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Provider Portal"
        description="Access and manage patient health records"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="patients">Patient Records</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="access">Request Access</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <ProviderDashboard 
            appointments={mockAppointments} 
            recentPatients={mockRecentPatients}
            onSelectPatient={handleSelectPatient}
            onAction={handleAction}
          />
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-6 mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="border-b border-slate-700 bg-slate-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-autheo-primary">Patient Records</CardTitle>
                  <CardDescription className="text-slate-300">
                    Search and access comprehensive patient health records
                  </CardDescription>
                </div>
                <div className="flex items-center px-3 py-1 rounded-full bg-autheo-primary/20 text-autheo-primary text-xs">
                  <Database className="h-3.5 w-3.5 mr-1" /> Electronic Health Records
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <PatientSearch onSelectPatient={handleSelectPatient} />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" />
                All record accesses are verified and logged for compliance
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-6 mt-6">
          <ProviderMessaging />
        </TabsContent>
        
        <TabsContent value="access" className="space-y-6 mt-6">
          <ProviderAccessRequest />
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-6 mt-6">
          <ProviderSchedule 
            appointments={mockAppointments} 
            onAction={handleAction} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderPortalPage;
