
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Calendar, Heart, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickActions from './QuickActions';
import KeyMetrics from './KeyMetrics';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import HealthRecordsOverview from '../health-records/HealthRecordsOverview';

interface Appointment {
  id: string;
  provider: string;
  date: string;
  time: string;
  type: string;
  location: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
}

interface PersonalizedDashboardProps {
  patientName?: string;
  recentMetrics?: any[];
  upcomingAppointments?: Appointment[];
  medications?: Medication[];
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  patientName = "Patient",
  recentMetrics = [],
  upcomingAppointments = [],
  medications = []
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { summary, healthMetrics } = useHealthRecords();
  
  // Sample appointments if none provided
  const defaultAppointments: Appointment[] = [
    {
      id: '1',
      provider: 'Dr. Sarah Johnson',
      date: 'May 25, 2025',
      time: '10:30 AM',
      type: 'Follow-up',
      location: 'Main Clinic'
    },
    {
      id: '2',
      provider: 'Dr. Michael Lee',
      date: 'Jun 12, 2025',
      time: '2:15 PM',
      type: 'Consultation',
      location: 'Virtual'
    }
  ];
  
  // Sample medications if none provided
  const defaultMedications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      nextDose: 'Today, 8:00 PM'
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      nextDose: 'Tomorrow, 8:00 AM'
    }
  ];
  
  // Use provided data or defaults
  const metrics = recentMetrics?.length > 0 ? recentMetrics : healthMetrics;
  const appointments = upcomingAppointments?.length > 0 ? upcomingAppointments : defaultAppointments;
  const meds = medications?.length > 0 ? medications : defaultMedications;
  
  const complianceScore = 92; // Mock compliance score

  const handleReschedule = (id: string) => {
    toast({
      title: "Appointment Rescheduling",
      description: "You'll be redirected to reschedule this appointment."
    });
  };
  
  const handleViewMore = (section: string) => {
    toast({
      title: `View More: ${section}`,
      description: `Navigating to full ${section.toLowerCase()} view.`
    });
    
    // Navigate to appropriate section
    if (section.toLowerCase().includes('health') || section.toLowerCase().includes('metrics')) {
      navigate('/wallet');
    } else if (section.toLowerCase().includes('appointment')) {
      navigate('/scheduling');
    } else if (section.toLowerCase().includes('medication')) {
      navigate('/wallet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient-primary bg-gradient-to-r from-autheo-primary to-autheo-secondary bg-clip-text text-transparent">
            Welcome, {patientName}
          </h1>
          <p className="text-muted-foreground">
            Your personalized health dashboard with real-time insights and information.
          </p>
        </div>
      </div>
      
      <QuickActions className="bg-slate-800/50" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader className="border-b border-slate-700 bg-slate-700/30">
            <CardTitle className="text-autheo-primary">Health Metrics</CardTitle>
            <CardDescription className="text-slate-300">Your recent health measurements</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <KeyMetrics 
              healthRecords={summary} 
              complianceScore={complianceScore} 
            />
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              {metrics.map((metric, idx) => (
                <Card key={idx} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-autheo-primary">{metric.name}</h3>
                      <Badge variant={metric.trend === 'up' ? 'outline' : 'secondary'} className="text-xs">
                        {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold text-slate-100">{metric.value}</span>
                      <span className="text-xs text-slate-300">{metric.unit}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Recorded: {metric.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-3 flex justify-end">
              <Button 
                variant="link" 
                className="text-autheo-primary hover:text-autheo-primary/80 p-0"
                onClick={() => handleViewMore("Health Metrics")}
              >
                View all metrics
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <HealthRecordsOverview />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onClick={() => handleViewMore("Appointments")}
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
                  onClick={() => handleViewMore("Appointments")}
                >
                  Schedule appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader className="border-b border-slate-700 bg-slate-700/30">
            <CardTitle className="text-autheo-primary flex items-center">
              <Bell className="mr-2 h-5 w-5 text-autheo-primary" /> Medication Reminders
            </CardTitle>
            <CardDescription className="text-slate-300">Upcoming medication doses</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {meds.length > 0 ? (
              <div className="space-y-3">
                {meds.map((medication) => (
                  <div key={medication.id} className="p-3 rounded-md border border-slate-700 bg-slate-700/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-autheo-primary">{medication.name} {medication.dosage}</p>
                        <p className="text-sm text-slate-300">{medication.frequency}</p>
                        <p className="text-xs text-autheo-primary mt-1">Next: {medication.nextDose}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-slate-300 hover:bg-slate-700 hover:text-autheo-primary"
                      >
                        Mark taken
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="link" 
                    className="text-autheo-primary hover:text-autheo-primary/80 p-0"
                    onClick={() => handleViewMore("Medications")}
                  >
                    View all medications
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-slate-300">No medication reminders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
