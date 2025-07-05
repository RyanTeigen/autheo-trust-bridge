
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Video, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAppointments, type Appointment } from '@/hooks/useAppointments';

interface AppointmentsCardProps {
  appointments: Appointment[];
  loading?: boolean;
}

const AppointmentsCard: React.FC<AppointmentsCardProps> = ({ appointments, loading = false }) => {
  const navigate = useNavigate();
  const { cancelAppointment } = useAppointments();
  
  const handleSchedule = () => {
    navigate('/scheduling');
  };

  const handleCancel = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment(appointmentId);
    }
  };

  const isToday = (dateString: string) => {
    return new Date(dateString).toDateString() === new Date().toDateString();
  };

  if (loading) {
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-slate-700 bg-slate-800/50 rounded-lg">
                <Skeleton className="h-4 w-20 mb-2 bg-slate-700" />
                <Skeleton className="h-4 w-32 mb-1 bg-slate-700" />
                <Skeleton className="h-4 w-40 bg-slate-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
          {appointments.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className={`p-3 border border-slate-700 bg-slate-800/50 rounded-lg ${
                  isToday(appointment.date) ? 'ring-2 ring-autheo-primary/30' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={appointment.type === 'Virtual' || appointment.location === 'Virtual' ? 
                        'bg-blue-100/10 text-blue-300 border-blue-300/20' : 
                        'bg-green-100/10 text-green-300 border-green-300/20'}
                    >
                      {appointment.type}
                    </Badge>
                    {isToday(appointment.date) && (
                      <Badge className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Today
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-autheo-primary" />
                  <span className="font-medium text-slate-100">{appointment.provider}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-autheo-primary" />
                  <span className="text-sm text-slate-300">{appointment.date} | {appointment.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  {appointment.location === 'Virtual' || appointment.location === 'Telehealth' ? 
                    <div className="flex items-center gap-1 text-sm text-blue-300">
                      <Video className="h-3.5 w-3.5" />
                      <span>{appointment.location}</span>
                    </div> :
                    <div className="flex items-center gap-1 text-sm text-green-300">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{appointment.location}</span>
                    </div>
                  }
                </div>
              </div>
            ))
          )}
          
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
