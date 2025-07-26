import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MessageSquare,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PatientOverview {
  id: string;
  name: string;
  lastVisit: string;
  status: 'active' | 'pending' | 'completed';
  recordsCount: number;
  hasNewRecords: boolean;
}

interface AppointmentSummary {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  accessGranted: boolean;
}

const ProviderWorkflowDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patients] = useState<PatientOverview[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      lastVisit: '2024-01-15',
      status: 'active',
      recordsCount: 12,
      hasNewRecords: true
    },
    {
      id: '2', 
      name: 'Michael Chen',
      lastVisit: '2024-01-10',
      status: 'pending',
      recordsCount: 8,
      hasNewRecords: false
    }
  ]);

  const [appointments] = useState<AppointmentSummary[]>([
    {
      id: '1',
      patientName: 'Sarah Johnson',
      time: '10:00 AM',
      type: 'Follow-up',
      status: 'scheduled',
      accessGranted: true
    },
    {
      id: '2',
      patientName: 'Michael Chen', 
      time: '2:30 PM',
      type: 'Initial Consultation',
      status: 'scheduled',
      accessGranted: false
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'scheduled':
        return 'default';
      case 'pending':
      case 'in-progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const todayStats = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    patientsWithAccess: appointments.filter(a => a.accessGranted).length,
    pendingRecords: patients.filter(p => p.hasNewRecords).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Stethoscope className="h-6 w-6 text-primary" />
            Provider Workflow Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome back, Dr. {profile?.first_name || profile?.last_name || 'Provider'}
          </p>
        </CardHeader>
      </Card>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-foreground">{todayStats.totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{todayStats.completedAppointments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Records Access</p>
                <p className="text-2xl font-bold text-foreground">{todayStats.patientsWithAccess}</p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Records</p>
                <p className="text-2xl font-bold text-foreground">{todayStats.pendingRecords}</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patient Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                      <div>
                        <p className="font-medium text-foreground">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type} - {appointment.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.accessGranted && (
                          <Shield className="h-4 w-4 text-success" />
                        )}
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Create SOAP Note
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Search Patients
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Secure Message
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle>Appointment Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Scheduled: {appointment.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.accessGranted ? (
                        <div className="flex items-center gap-1 text-success">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm">Access Granted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-warning">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Pending Access</span>
                        </div>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle>Patient Records Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last visit: {patient.lastVisit} • {patient.recordsCount} records
                          </p>
                        </div>
                        <Badge variant={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        {patient.hasNewRecords && (
                          <Badge variant="secondary">New Records</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        View Records
                      </Button>
                      <Button size="sm" variant="default">
                        Request Access
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

export default ProviderWorkflowDashboard;