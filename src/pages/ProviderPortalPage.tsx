import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PatientSearch from '@/components/emr/PatientSearch';
import ProviderDashboard from '@/components/provider/ProviderDashboard';
import ProviderSchedule from '@/components/provider/ProviderSchedule';
import PageHeader from '@/components/dashboard/PageHeader';
import ProviderMessaging from '@/components/provider/ProviderMessaging';
import ProviderAccessRequest from '@/components/provider-access/ProviderAccessRequest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Shield, Database, Bell } from 'lucide-react';
import NotificationBanner from '@/components/provider/NotificationBanner';
import ProviderMetrics from '@/components/provider/ProviderMetrics';
import AdvancedPatientSearch from '@/components/emr/AdvancedPatientSearch';
import ProviderCalendar from '@/components/provider/ProviderCalendar';
import { Badge } from '@/components/ui/badge';

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

// Mock data for advanced patient search
const mockPatientRecords = [
  { id: 'P12345', name: 'John Doe', dob: '1985-06-15', mrn: 'MRN123456', lastVisit: '2025-05-10', insuranceProvider: 'BlueCross', primaryCareProvider: 'Dr. Smith', tags: ['Chronic Condition'] },
  { id: 'P23456', name: 'Jane Smith', dob: '1990-03-22', mrn: 'MRN234567', lastVisit: '2025-05-08', insuranceProvider: 'Aetna', primaryCareProvider: 'Dr. Johnson', tags: ['New Patient'] },
  { id: 'P34567', name: 'Robert Johnson', dob: '1975-11-30', mrn: 'MRN345678', lastVisit: '2025-05-05', insuranceProvider: 'UnitedHealth', primaryCareProvider: 'Dr. Williams', tags: ['Follow-up Required'] },
  { id: 'P45678', name: 'Emily Wilson', dob: '1982-09-18', mrn: 'MRN456789', lastVisit: '2025-05-01', insuranceProvider: 'Medicare', primaryCareProvider: 'Dr. Davis', tags: ['High Risk', 'Chronic Condition'] },
  { id: 'P56789', name: 'Michael Brown', dob: '1968-07-24', mrn: 'MRN567890', lastVisit: '2025-04-28', insuranceProvider: 'Cigna', primaryCareProvider: 'Dr. Brown', tags: ['Specialist Referral'] },
];

// Mock notifications
const mockNotifications = [
  { id: 'N1', type: 'alert', message: 'Lab results for patient John Doe require immediate review', timestamp: '10 min ago' },
  { id: 'N2', type: 'info', message: 'New patient referral received from Dr. Williams', timestamp: '25 min ago' },
];

// Mock provider metrics
const mockProviderMetrics = {
  patientsToday: 8,
  completedAppointments: 3,
  upcomingAppointments: 5,
  averageWaitTime: '12 min',
  patientSatisfaction: 92,
  pendingTasks: 4
};

const ProviderPortalPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [patientSearchResults, setPatientSearchResults] = useState(mockPatientRecords);

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
  
  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: "Notification Dismissed",
      description: "The notification has been removed from your list.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-3xl font-semibold tracking-tight">Provider Portal</h2>
        <p className="text-muted-foreground">Access and manage patient health records</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30 flex items-center">
            <Shield className="h-3.5 w-3.5 mr-1" /> HIPAA Compliant
          </Badge>
          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 flex items-center">
            <Bell className="h-3.5 w-3.5 mr-1" /> {notifications.length} Alerts
          </Badge>
        </div>
      </div>
      
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
        
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <ProviderMetrics metrics={mockProviderMetrics} />
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
                <AdvancedPatientSearch 
                  patients={mockPatientRecords}
                  onSearch={setPatientSearchResults}
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Search Results</h3>
                  {patientSearchResults.length > 0 ? (
                    <div className="space-y-2">
                      {patientSearchResults.map((patient) => (
                        <div 
                          key={patient.id} 
                          className="p-3 rounded-md bg-slate-700/30 border border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                          onClick={() => handleSelectPatient(patient.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-slate-200">{patient.name}</h4>
                              <p className="text-sm text-slate-400">DOB: {patient.dob} | MRN: {patient.mrn}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-autheo-primary">{patient.primaryCareProvider}</span>
                              <span className="text-xs text-slate-400">Last visit: {patient.lastVisit}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex gap-2">
                            {patient.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-slate-800/70">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      No patient records match your search criteria
                    </div>
                  )}
                </div>
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
          <ProviderMessaging isEnhanced={true} />
        </TabsContent>
        
        <TabsContent value="access" className="space-y-6 mt-6">
          <ProviderAccessRequest isEnhanced={true} />
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-6 mt-6">
          <ProviderCalendar 
            appointments={mockAppointments} 
            onAction={handleAction} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderPortalPage;
