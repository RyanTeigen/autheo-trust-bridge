
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Appointment {
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
  const navigate = useNavigate();
  
  const handleSchedule = () => {
    navigate('/scheduling');
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Upcoming Appointments</CardTitle>
        <CardDescription className="text-slate-300">
          Your scheduled appointments with healthcare providers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id}
              className="p-3 border border-slate-700 bg-slate-800/50 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="mb-2">
                  <Badge 
                    variant="outline" 
                    className={appointment.type === 'Virtual' || appointment.location === 'Virtual' ? 
                      'bg-blue-100/10 text-blue-300 border-blue-300/20' : 
                      'bg-green-100/10 text-green-300 border-green-300/20'}
                  >
                    {appointment.type}
                  </Badge>
                </div>
                <div className="text-sm text-slate-300">
                  {appointment.location === 'Virtual' ? 
                    <div className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-blue-300" />
                      <span>Telemedicine</span>
                    </div> :
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-green-300" />
                      <span>{appointment.location}</span>
                    </div>
                  }
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-autheo-primary" />
                <span className="font-medium text-slate-100">{appointment.provider}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-autheo-primary" />
                <span className="text-sm text-slate-300">{appointment.date} | {appointment.time}</span>
              </div>
            </div>
          ))}
          
          <div className="mt-2">
            <Button 
              onClick={handleSchedule}
              className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Calendar className="h-4 w-4 mr-2" /> Schedule New Appointment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsCard;
