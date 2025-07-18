import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TelehealthScheduler from '@/components/telemedicine/TelehealthScheduler';
import VideoCallInterface from '@/components/telemedicine/VideoCallInterface';
import { Video, Calendar, Users, Settings, Clock, Phone } from 'lucide-react';
import { TelehealthSession } from '@/types/fhir';

const TelemedicinePage: React.FC = () => {
  const [activeCall, setActiveCall] = useState<TelehealthSession | null>(null);
  const [currentUserId] = useState('current-user-id');

  // Mock session for demo
  const mockSession: TelehealthSession = {
    id: 'session-123',
    appointmentId: 'apt-456',
    patientId: 'patient-789',
    providerId: 'provider-101',
    status: 'active',
    startTime: new Date().toISOString(),
    roomId: 'room-123',
    recordingEnabled: false,
    participants: [
      {
        userId: 'patient-789',
        role: 'patient',
        joinedAt: new Date().toISOString(),
        connectionStatus: 'connected'
      },
      {
        userId: 'provider-101',
        role: 'provider',
        joinedAt: new Date().toISOString(),
        connectionStatus: 'connected'
      }
    ]
  };

  const handleStartCall = () => {
    setActiveCall(mockSession);
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  if (activeCall) {
    return (
      <VideoCallInterface
        session={activeCall}
        currentUserId={currentUserId}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Telemedicine Platform</h1>
        <p className="text-muted-foreground mt-2">
          Schedule appointments, conduct video consultations, and manage virtual healthcare delivery
        </p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            My Appointments
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Calls
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <TelehealthScheduler />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled telehealth sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: '1',
                    date: 'Today, 2:00 PM',
                    provider: 'Dr. Sarah Smith',
                    type: 'Follow-up Consultation',
                    status: 'confirmed'
                  },
                  {
                    id: '2',
                    date: 'Tomorrow, 10:30 AM',
                    provider: 'Dr. Mike Johnson',
                    type: 'Cardiology Review',
                    status: 'pending'
                  },
                  {
                    id: '3',
                    date: 'Friday, 3:00 PM',
                    provider: 'Dr. Emily Wilson',
                    type: 'Dermatology Check',
                    status: 'confirmed'
                  }
                ].map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{appointment.type}</h4>
                        <p className="text-sm text-gray-600">{appointment.provider}</p>
                        <p className="text-sm text-gray-500">{appointment.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={handleStartCall}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Video className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Completed telehealth appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: '1',
                    date: 'Yesterday, 11:00 AM',
                    provider: 'Dr. Robert Lee',
                    type: 'Annual Checkup',
                    duration: '25 minutes'
                  },
                  {
                    id: '2',
                    date: 'Last Week, 2:30 PM',
                    provider: 'Dr. Lisa Chen',
                    type: 'Mental Health Session',
                    duration: '45 minutes'
                  },
                  {
                    id: '3',
                    date: '2 weeks ago, 9:00 AM',
                    provider: 'Dr. Sarah Smith',
                    type: 'Prescription Review',
                    duration: '15 minutes'
                  }
                ].map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.type}</h4>
                        <p className="text-sm text-gray-600">{session.provider}</p>
                        <p className="text-sm text-gray-500">{session.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.duration}</p>
                        <p className="text-xs text-green-600">Completed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Call</CardTitle>
                <CardDescription>Start an instant video consultation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={handleStartCall}
                  className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Video className="h-5 w-5" />
                  Start Video Call
                </button>
                <p className="text-xs text-gray-500 text-center">
                  For urgent consultations with available providers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audio Only</CardTitle>
                <CardDescription>Voice consultation without video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Start Audio Call
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Perfect for follow-ups and check-ins
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Session</CardTitle>
                <CardDescription>Multi-participant consultation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  Start Group Call
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Include family members or care team
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Quality Test</CardTitle>
              <CardDescription>Test your camera, microphone, and connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Video className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium">Camera Test</h4>
                  <p className="text-sm text-gray-600 mb-3">Check video quality</p>
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded">
                    Test Camera
                  </button>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">Microphone Test</h4>
                  <p className="text-sm text-gray-600 mb-3">Check audio quality</p>
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded">
                    Test Microphone
                  </button>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-medium">Connection Test</h4>
                  <p className="text-sm text-gray-600 mb-3">Check network speed</p>
                  <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded">
                    Test Connection
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Call Settings</CardTitle>
              <CardDescription>Configure your telemedicine preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-enable video</h4>
                    <p className="text-sm text-gray-600">Start calls with video enabled by default</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-enable audio</h4>
                    <p className="text-sm text-gray-600">Start calls with microphone enabled</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable call recording</h4>
                    <p className="text-sm text-gray-600">Allow recording of video consultations</p>
                  </div>
                  <input type="checkbox" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Background blur</h4>
                    <p className="text-sm text-gray-600">Automatically blur background during calls</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Noise cancellation</h4>
                    <p className="text-sm text-gray-600">Reduce background noise during calls</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage appointment and call notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Appointment reminders</h4>
                    <p className="text-sm text-gray-600">Get notified before scheduled appointments</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Call notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications for incoming calls</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email notifications</h4>
                    <p className="text-sm text-gray-600">Send appointment confirmations via email</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelemedicinePage;