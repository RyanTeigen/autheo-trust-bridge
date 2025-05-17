
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, User, Phone, MessageCircle, Plus, Camera, Mic, MicOff, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Appointment {
  id: string;
  provider: string;
  providerTitle: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'pending' | 'completed' | 'canceled';
  notes?: string;
  providerPhoto?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    provider: 'Dr. Emily Chen',
    providerTitle: 'Primary Care Physician',
    date: '2025-05-25',
    time: '10:30 AM',
    duration: 30,
    type: 'video',
    status: 'scheduled',
    notes: 'Follow-up on recent lab results and medication adjustment.',
    providerPhoto: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '2',
    provider: 'Dr. James Wilson',
    providerTitle: 'Cardiologist',
    date: '2025-06-10',
    time: '2:15 PM',
    duration: 45,
    type: 'video',
    status: 'scheduled',
    notes: 'Annual cardiac evaluation and stress test results review.',
    providerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '3',
    provider: 'Dr. Sarah Johnson',
    providerTitle: 'Dermatologist',
    date: '2025-05-20',
    time: '11:00 AM',
    duration: 20,
    type: 'phone',
    status: 'scheduled',
    notes: 'Quick check on treatment progress for skin condition.'
  },
  {
    id: '4',
    provider: 'Dr. Michael Brown',
    providerTitle: 'Endocrinologist',
    date: '2025-04-15',
    time: '9:45 AM',
    duration: 30,
    type: 'video',
    status: 'completed',
    notes: 'Diabetes management and medication review.'
  }
];

const TelemedicineInterface: React.FC = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [callTime, setCallTime] = useState(0);
  
  // Get upcoming appointments
  const upcomingAppointments = appointments.filter(
    app => app.status === 'scheduled' && new Date(`${app.date} ${app.time}`) > new Date()
  );
  
  // Get past appointments
  const pastAppointments = appointments.filter(
    app => app.status === 'completed' || new Date(`${app.date} ${app.time}`) < new Date()
  );
  
  const handleJoinCall = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsVideoDialogOpen(true);
    
    // In a real app, this would initiate a WebRTC connection
    toast({
      title: "Joining video call",
      description: `Connecting to ${appointment.provider}...`
    });
  };
  
  const handleStartCall = () => {
    setIsCallStarted(true);
    // In a real app, this would be when the WebRTC connection is established
    
    // Start timer
    const interval = setInterval(() => {
      setCallTime(prev => prev + 1);
    }, 1000);
    
    // Store interval ID for cleanup
    return () => clearInterval(interval);
  };
  
  const handleEndCall = () => {
    setIsCallStarted(false);
    setCallTime(0);
    setIsVideoDialogOpen(false);
    
    toast({
      title: "Call ended",
      description: `Your call with ${selectedAppointment?.provider} has ended.`
    });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const isToday = (dateStr: string) => {
    const today = new Date();
    const appointmentDate = new Date(dateStr);
    return appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear();
  };
  
  const formatAppointmentDate = (dateStr: string) => {
    if (isToday(dateStr)) return 'Today';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getAppointmentTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-autheo-primary" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-autheo-primary" />;
      case 'in-person':
        return <User className="h-4 w-4 text-autheo-primary" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-autheo-primary flex items-center">
                <Video className="mr-2 h-5 w-5" /> Telemedicine
              </CardTitle>
              <CardDescription className="text-slate-300">
                Secure video consultations with your healthcare providers
              </CardDescription>
            </div>
            <Button 
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              <Plus className="mr-1 h-4 w-4" /> Schedule Consultation
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-autheo-primary mb-3">Upcoming Appointments</h3>
              
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="bg-slate-900/50 border-slate-700 overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10 border border-slate-600">
                              {appointment.providerPhoto ? (
                                <AvatarImage src={appointment.providerPhoto} />
                              ) : null}
                              <AvatarFallback className="bg-autheo-primary/20 text-autheo-primary">
                                {appointment.provider.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h4 className="font-medium text-autheo-primary">{appointment.provider}</h4>
                              <p className="text-xs text-slate-400">{appointment.providerTitle}</p>
                            </div>
                          </div>
                          
                          <Badge className="flex items-center gap-1 bg-slate-700/50 text-slate-300">
                            {getAppointmentTypeIcon(appointment.type)}
                            {appointment.type === 'video' ? 'Video' : appointment.type === 'phone' ? 'Phone' : 'In-Person'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-400">Date</p>
                            <p className="flex items-center text-slate-300">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-autheo-primary" />
                              {formatAppointmentDate(appointment.date)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400">Time</p>
                            <p className="flex items-center text-slate-300">
                              <Clock className="h-3.5 w-3.5 mr-1 text-autheo-primary" />
                              {appointment.time}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400">Duration</p>
                            <p className="text-slate-300">{appointment.duration} mins</p>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                            {appointment.notes}
                          </p>
                        )}
                        
                        <div className="flex space-x-2">
                          {appointment.type === 'video' && isToday(appointment.date) && (
                            <Button 
                              className="flex-1 bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                              onClick={() => handleJoinCall(appointment)}
                            >
                              <Video className="h-4 w-4 mr-1" /> Join Now
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline"
                            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" /> Message
                          </Button>
                          
                          {!isToday(appointment.date) && (
                            <Button 
                              variant="outline"
                              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              <Calendar className="h-4 w-4 mr-1" /> Reschedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-900/30 border-slate-700">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-10 w-10 text-slate-600 mb-2" />
                    <p className="text-slate-300">No upcoming telemedicine appointments</p>
                    <Button className="mt-4 bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900">
                      <Plus className="mr-1 h-4 w-4" /> Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-autheo-primary mb-3">Past Appointments</h3>
                
                <div className="space-y-3">
                  {pastAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="p-3 rounded-md border border-slate-700 bg-slate-900/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-slate-300">{appointment.provider}</h4>
                            <Badge className="ml-2 bg-slate-700/50 text-slate-300 text-xs flex items-center gap-1">
                              {getAppointmentTypeIcon(appointment.type)}
                              {appointment.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time} · {appointment.duration} mins
                          </p>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-autheo-primary hover:bg-slate-800/50"
                        >
                          View Summary
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {pastAppointments.length > 3 && (
                  <div className="flex justify-end mt-2">
                    <Button variant="link" className="text-autheo-primary hover:text-autheo-primary/80 p-0">
                      View all past appointments
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Video Call Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={(open) => {
        // Prevent accidental closing if call is in progress
        if (!open && isCallStarted) {
          if (confirm("Are you sure you want to end the call?")) {
            handleEndCall();
          }
          return;
        }
        setIsVideoDialogOpen(open);
      }}>
        <DialogContent className="bg-slate-900 text-slate-100 border-slate-700 max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-autheo-primary">
                {isCallStarted ? 'In Call with ' : 'Connecting to '} 
                {selectedAppointment?.provider}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {isCallStarted ? (
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Call in progress - {formatTime(callTime)}
                  </span>
                ) : (
                  'Prepare your camera and microphone'
                )}
              </DialogDescription>
            </div>
            
            {isCallStarted && (
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                  <Video className="h-3 w-3 mr-1 text-autheo-primary" /> Secure Encrypted Call
                </Badge>
              </div>
            )}
          </DialogHeader>
          
          <div className="h-96 bg-slate-800/50 rounded-md overflow-hidden relative">
            {/* This would be the WebRTC video stream in a real app */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {!isCallStarted ? (
                <>
                  <Avatar className="h-24 w-24 mb-4 border-2 border-autheo-primary">
                    {selectedAppointment?.providerPhoto ? (
                      <AvatarImage src={selectedAppointment.providerPhoto} />
                    ) : null}
                    <AvatarFallback className="bg-autheo-primary/20 text-autheo-primary text-4xl">
                      {selectedAppointment?.provider.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-medium text-autheo-primary mb-1">
                    {selectedAppointment?.provider}
                  </h3>
                  <p className="text-slate-400 mb-4">{selectedAppointment?.providerTitle}</p>
                  
                  {!isCallStarted && (
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-48 h-2" />
                      <span className="text-xs text-slate-400">Connecting...</span>
                    </div>
                  )}
                </>
              ) : (
                // Placeholder for video stream
                <div className="text-center">
                  <Video className="h-12 w-12 text-autheo-primary/40 mb-2 mx-auto" />
                  <p className="text-slate-400">Video stream would appear here</p>
                  <p className="text-xs text-slate-500 mt-2">(In a real app, this would show the WebRTC video stream)</p>
                </div>
              )}
            </div>
            
            {isCallStarted && (
              <div className="absolute right-4 bottom-4 w-40 h-32 bg-slate-700 rounded-md border border-slate-600">
                {/* This would be the self-view video in a real app */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isVideoEnabled ? (
                    <User className="h-8 w-8 text-autheo-primary/40" />
                  ) : (
                    <VideoOff className="h-8 w-8 text-slate-500/60" />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-3 py-2">
            <Button
              size="icon"
              variant={isVideoEnabled ? "outline" : "destructive"}
              className={`rounded-full p-3 h-12 w-12 ${
                isVideoEnabled 
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800" 
                  : "bg-red-800/50 text-red-300 hover:bg-red-800/70"
              }`}
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              {isVideoEnabled ? (
                <Camera className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant={isAudioEnabled ? "outline" : "destructive"}
              className={`rounded-full p-3 h-12 w-12 ${
                isAudioEnabled 
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800" 
                  : "bg-red-800/50 text-red-300 hover:bg-red-800/70"
              }`}
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            >
              {isAudioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            
            {isCallStarted ? (
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full p-3 h-12 w-12"
                onClick={handleEndCall}
              >
                <Phone className="h-5 w-5 rotate-135" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="rounded-full p-3 h-12 w-12 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleStartCall}
              >
                <Phone className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <div className="w-full flex justify-between items-center">
              <p className="text-xs text-slate-400">
                All calls are encrypted end-to-end for your privacy
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                  if (isCallStarted) {
                    handleEndCall();
                  } else {
                    setIsVideoDialogOpen(false);
                  }
                }}
              >
                {isCallStarted ? 'End Call' : 'Cancel'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelemedicineInterface;
