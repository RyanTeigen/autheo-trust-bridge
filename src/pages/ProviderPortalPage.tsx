
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ClipboardCheck, Clock, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PatientSearch from '@/components/emr/PatientSearch';

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Provider Portal</h1>
        <p className="text-muted-foreground">
          Access and manage patient health records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.time} - {appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={appointment.status === 'Checked In' ? 'default' : 'outline'}>
                          {appointment.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={handleAction}>View</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full" onClick={handleAction}>
                    View All Appointments
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full flex items-center justify-start" onClick={handleAction}>
                  <Users className="mr-2 h-4 w-4" />
                  New Patient Intake
                </Button>
                <Button className="w-full flex items-center justify-start" variant="outline" onClick={handleAction}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
                <Button className="w-full flex items-center justify-start" variant="outline" onClick={handleAction}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Progress Note
                </Button>
                <Button className="w-full flex items-center justify-start" variant="outline" onClick={handleAction}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Create Prescription
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()} - {patient.reason}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSelectPatient(patient.id)}>
                      Open Record
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Search</CardTitle>
              <CardDescription>
                Find and manage patient records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientSearch onSelectPatient={handleSelectPatient} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Schedule</CardTitle>
              <CardDescription>
                Manage your daily appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time} - {appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.status === 'Checked In' ? 'default' : 'outline'}>
                        {appointment.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={handleAction}>Check In</Button>
                      <Button variant="ghost" size="sm" onClick={handleAction}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderPortalPage;
