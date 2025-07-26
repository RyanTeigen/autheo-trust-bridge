import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video, Users, Shield, Settings, Activity, Wifi, Clock, PhoneCall } from 'lucide-react';

interface SessionMetrics {
  active_sessions: number;
  completed_sessions: number;
  average_duration: number;
  quality_score: number;
  uptime_percentage: number;
}

interface TelehealthSession {
  id: string;
  patient_name: string;
  provider_name: string;
  session_type: string;
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  start_time: string;
  duration?: number;
  quality_metrics?: {
    video_quality: number;
    audio_quality: number;
    connection_stability: number;
  };
}

const TelemedicineInfrastructure: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('dashboard');

  const sessionMetrics: SessionMetrics = {
    active_sessions: 12,
    completed_sessions: 1847,
    average_duration: 28,
    quality_score: 94,
    uptime_percentage: 99.8
  };

  const recentSessions: TelehealthSession[] = [
    {
      id: '1',
      patient_name: 'Sarah Johnson',
      provider_name: 'Dr. Emily Chen',
      session_type: 'Follow-up Consultation',
      status: 'active',
      start_time: '2024-01-26T14:30:00Z',
      quality_metrics: {
        video_quality: 95,
        audio_quality: 92,
        connection_stability: 98
      }
    },
    {
      id: '2',
      patient_name: 'Michael Roberts',
      provider_name: 'Dr. James Wilson',
      session_type: 'Initial Consultation',
      status: 'completed',
      start_time: '2024-01-26T13:00:00Z',
      duration: 45,
      quality_metrics: {
        video_quality: 88,
        audio_quality: 94,
        connection_stability: 91
      }
    },
    {
      id: '3',
      patient_name: 'Lisa Anderson',
      provider_name: 'Dr. Maria Garcia',
      session_type: 'Mental Health Session',
      status: 'scheduled',
      start_time: '2024-01-26T16:00:00Z'
    }
  ];

  const infrastructureComponents = [
    {
      name: 'Video Conferencing Service',
      status: 'operational',
      uptime: 99.9,
      description: 'WebRTC-based video calling infrastructure'
    },
    {
      name: 'HIPAA-Compliant Recording',
      status: 'operational',
      uptime: 99.8,
      description: 'Encrypted session recording and storage'
    },
    {
      name: 'Real-time Chat Service',
      status: 'operational',
      uptime: 99.7,
      description: 'Secure messaging during sessions'
    },
    {
      name: 'File Sharing Service',
      status: 'maintenance',
      uptime: 98.5,
      description: 'Secure document and image sharing'
    },
    {
      name: 'Session Analytics',
      status: 'operational',
      uptime: 99.6,
      description: 'Quality monitoring and analytics'
    },
    {
      name: 'Backup Communication',
      status: 'operational',
      uptime: 99.9,
      description: 'Phone bridge and backup connectivity'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'degraded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'outage':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sessionMetrics.active_sessions}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                  <Activity className="h-4 w-4 mx-auto mt-2 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sessionMetrics.completed_sessions}</div>
                  <div className="text-sm text-muted-foreground">Completed Today</div>
                  <Video className="h-4 w-4 mx-auto mt-2 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{sessionMetrics.average_duration}m</div>
                  <div className="text-sm text-muted-foreground">Avg Duration</div>
                  <Clock className="h-4 w-4 mx-auto mt-2 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{sessionMetrics.quality_score}%</div>
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                  <Wifi className="h-4 w-4 mx-auto mt-2 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sessionMetrics.uptime_percentage}%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                  <Shield className="h-4 w-4 mx-auto mt-2 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{session.patient_name}</h4>
                          <Badge className={getSessionStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Provider: {session.provider_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {session.session_type}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(session.start_time).toLocaleTimeString()}
                        {session.duration && <div>{session.duration} minutes</div>}
                      </div>
                    </div>

                    {session.quality_metrics && (
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Video Quality</div>
                          <div className="text-sm font-medium">{session.quality_metrics.video_quality}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Audio Quality</div>
                          <div className="text-sm font-medium">{session.quality_metrics.audio_quality}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Connection</div>
                          <div className="text-sm font-medium">{session.quality_metrics.connection_stability}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Active Telemedicine Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.filter(s => s.status === 'active').map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.patient_name} ↔ {session.provider_name}</h4>
                        <p className="text-sm text-muted-foreground">{session.session_type}</p>
                        <p className="text-xs text-muted-foreground">
                          Started: {new Date(session.start_time).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-1" />
                          Monitor
                        </Button>
                        <Button size="sm" variant="outline">
                          <PhoneCall className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {recentSessions.filter(s => s.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active sessions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Infrastructure Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructureComponents.map((component, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{component.name}</h4>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {component.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uptime</span>
                        <span>{component.uptime}%</span>
                      </div>
                      <Progress value={component.uptime} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Telemedicine Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quality Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Video Quality</label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">720p</Button>
                          <Button variant="default" size="sm">1080p</Button>
                          <Button variant="outline" size="sm">4K</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Audio Bitrate</label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">64kbps</Button>
                          <Button variant="default" size="sm">128kbps</Button>
                          <Button variant="outline" size="sm">256kbps</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">End-to-End Encryption</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session Recording</span>
                        <Badge variant="secondary">HIPAA Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Waiting Room</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Integration Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">EHR Integration</span>
                          <p className="text-xs text-muted-foreground">
                            Automatically sync session notes to patient records
                          </p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Calendar Integration</span>
                          <p className="text-xs text-muted-foreground">
                            Sync with provider calendars and send reminders
                          </p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Payment Integration</span>
                          <p className="text-xs text-muted-foreground">
                            Process payments and insurance claims
                          </p>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelemedicineInfrastructure;