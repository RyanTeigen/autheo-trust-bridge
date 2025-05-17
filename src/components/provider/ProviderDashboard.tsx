import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Badge from '@/components/emr/Badge';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  reason: string;
}

interface ProviderDashboardProps {
  appointments: Appointment[];
  recentPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAction: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ 
  appointments, 
  recentPatients, 
  onSelectPatient,
  onAction 
}) => {
  return (
    <div className="space-y-6">
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
              {appointments.slice(0, 3).map((appointment) => (
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
                    <Button variant="outline" size="sm" onClick={onAction}>View</Button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full" onClick={onAction}>
                View All Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <QuickActionsCard onAction={onAction} />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString()} - {patient.reason}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onSelectPatient(patient.id)}>
                  Open Record
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Internal component to keep the file more focused
const QuickActionsCard: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full flex items-center justify-start" onClick={onAction}>
          <Users className="mr-2 h-4 w-4" />
          New Patient Intake
        </Button>
        <Button className="w-full flex items-center justify-start" variant="outline" onClick={onAction}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
        <Button className="w-full flex items-center justify-start" variant="outline" onClick={onAction}>
          <FileText className="mr-2 h-4 w-4" />
          Create Progress Note
        </Button>
        <Button className="w-full flex items-center justify-start" variant="outline" onClick={onAction}>
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Create Prescription
        </Button>
      </CardContent>
    </Card>
  );
};

// Missing import for the QuickActionsCard component
import { Users, CalendarIcon, FileText, ClipboardCheck } from 'lucide-react';

export default ProviderDashboard;
