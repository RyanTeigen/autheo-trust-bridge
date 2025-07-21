
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProviderActivity } from '@/hooks/useProviderActivity';
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments';
import { useEnhancedProviderMetrics } from '@/hooks/useEnhancedProviderMetrics';
import { useAppointmentStatusManager } from '@/hooks/useAppointmentStatusManager';
import EnhancedMetricCard from '@/components/provider/EnhancedMetricCard';
import {
  Users,
  Calendar,
  Clock,
  Shield,
  Lock,
  Eye,
  Activity,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';

const ProviderDashboardTab: React.FC = () => {
  const { recentActivity, loading: activityLoading } = useProviderActivity();
  const { metrics, isLoading: metricsLoading } = useEnhancedProviderMetrics();
  const { 
    appointments, 
    todayAppointments, 
    upcomingAppointments, 
    inProgressAppointments,
    isConnected, 
    isLoading: appointmentsLoading 
  } = useRealtimeAppointments();
  
  const { 
    startAppointment, 
    completeAppointment, 
    cancelAppointment, 
    markNoShow, 
    isUpdating 
  } = useAppointmentStatusManager();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600 hover:bg-blue-700';
      case 'in_progress': return 'bg-green-600 hover:bg-green-700';
      case 'completed': return 'bg-gray-600 hover:bg-gray-700';
      case 'cancelled': return 'bg-red-600 hover:bg-red-700';
      case 'no_show': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no_show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (metricsLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedMetricCard
          title="Patients Today"
          value={metrics.patientsToday}
          icon={<Users className="h-6 w-6 text-autheo-primary" />}
          trend={{ value: 5, isPositive: true }}
          isRealTime={true}
          isConnected={isConnected}
          description="Scheduled for today"
        />
        
        <EnhancedMetricCard
          title="Completed Today"
          value={metrics.completedAppointments}
          icon={<CheckCircle className="h-6 w-6 text-green-400" />}
          progress={metrics.completionRate}
          isRealTime={true}
          isConnected={isConnected}
          badge={{ text: `${metrics.completionRate}%`, variant: 'default' }}
        />
        
        <EnhancedMetricCard
          title="Upcoming"
          value={metrics.upcomingAppointments}
          icon={<Calendar className="h-6 w-6 text-blue-400" />}
          description="Scheduled appointments"
          isRealTime={true}
          isConnected={isConnected}
        />
        
        <EnhancedMetricCard
          title="In Progress"
          value={metrics.inProgressAppointments}
          icon={<Activity className="h-6 w-6 text-green-400" />}
          description="Currently active"
          isRealTime={true}
          isConnected={isConnected}
          badge={{ text: 'LIVE', variant: 'default' }}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedMetricCard
          title="Avg Wait Time"
          value={metrics.averageWaitTime}
          icon={<Clock className="h-6 w-6 text-amber-400" />}
          trend={{ value: 3, isPositive: false }}
          isRealTime={true}
          isConnected={isConnected}
        />
        
        <EnhancedMetricCard
          title="Patient Satisfaction"
          value={`${metrics.patientSatisfaction}%`}
          icon={<Users className="h-6 w-6 text-green-400" />}
          progress={metrics.patientSatisfaction}
          isRealTime={false}
          isConnected={isConnected}
        />
        
        <EnhancedMetricCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          icon={<AlertCircle className="h-6 w-6 text-red-400" />}
          description="Requires attention"
          isRealTime={true}
          isConnected={isConnected}
        />
      </div>

      {/* Today's Appointments with Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Calendar className="h-5 w-5" />
            Today's Appointments
            {isConnected && (
              <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{appointment.patient_name}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(appointment.appointment_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {appointment.appointment_type}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => startAppointment(appointment.id)}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Start
                      </Button>
                    )}
                    
                    {appointment.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => completeAppointment(appointment.id)}
                        disabled={isUpdating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Complete
                      </Button>
                    )}
                    
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markNoShow(appointment.id)}
                        disabled={isUpdating}
                        className="border-orange-600 text-orange-400 hover:bg-orange-600"
                      >
                        No Show
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-autheo-primary">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLoading ? (
                <div className="text-center text-slate-400 py-4">Loading recent activity...</div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{activity.action}</p>
                      <p className="text-xs text-slate-400">{activity.patient}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {activity.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-4">No recent activity to display</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-autheo-primary">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-200">Post-Quantum Encryption</span>
                </div>
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">HIPAA Compliance</span>
                </div>
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-200">Audit Logs</span>
                </div>
                <Badge variant="secondary" className="bg-slate-600 text-slate-200">Monitoring</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboardTab;
