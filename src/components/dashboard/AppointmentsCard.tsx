
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface Appointment {
  id: string;
  provider: string;
  date: string;
  time: string;
  type: string;
  location: string;
}

interface AppointmentsCardProps {
  appointments: Appointment[];
}

const AppointmentsCard: React.FC<AppointmentsCardProps> = ({ appointments }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleReschedule = (id: string) => {
    toast({
      title: "Appointment Rescheduling",
      description: "You'll be redirected to reschedule this appointment."
    });
  };
  
  const handleViewMore = () => {
    toast({
      title: "View More: Appointments",
      description: "Navigating to full appointments view."
    });
    navigate('/scheduling');
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-autheo-primary flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-autheo-primary" /> Upcoming Appointments
            </CardTitle>
            <CardDescription className="text-slate-300">Your scheduled healthcare visits</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-3 rounded-md border border-slate-700 bg-slate-700/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-autheo-primary">{appointment.provider}</p>
                    <p className="text-sm text-slate-300">{appointment.type} - {appointment.date}, {appointment.time}</p>
                    <p className="text-xs text-slate-400 mt-1">Location: {appointment.location}</p>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="h-7 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => handleReschedule(appointment.id)}
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="mt-2 flex justify-end">
              <Button 
                variant="link" 
                className="text-autheo-primary hover:text-autheo-primary/80 p-0"
                onClick={handleViewMore}
              >
                Schedule new appointment
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-slate-300">No upcoming appointments</p>
            <Button 
              className="mt-2 bg-autheo-primary hover:bg-autheo-primary/90"
              onClick={handleViewMore}
            >
              Schedule appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsCard;
