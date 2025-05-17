
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText } from 'lucide-react';
import Badge from '@/components/emr/Badge';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface ProviderScheduleProps {
  appointments: Appointment[];
  onAction: () => void;
}

const ProviderSchedule: React.FC<ProviderScheduleProps> = ({ appointments, onAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Schedule</CardTitle>
        <CardDescription>
          Manage your daily appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
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
                <Button variant="outline" size="sm" onClick={onAction}>Check In</Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/medical-notes">
                    <FileText className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderSchedule;
