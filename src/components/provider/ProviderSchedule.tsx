
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
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Appointment Schedule</CardTitle>
        <CardDescription className="text-slate-300">
          Manage your daily appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 border border-slate-700 rounded-md bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="bg-slate-700/50 h-10 w-10 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-autheo-primary" />
                </div>
                <div>
                  <p className="font-medium">{appointment.patientName}</p>
                  <p className="text-sm text-slate-300">{appointment.time} - {appointment.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={appointment.status === 'Checked In' ? 'default' : 'outline'}>
                  {appointment.status}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onAction}
                  className="border-slate-700 bg-slate-800 hover:bg-slate-700"
                >
                  Check In
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white hover:bg-slate-700">
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
