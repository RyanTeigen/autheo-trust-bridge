
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  FileText,
  MessageCircle,
  Clock,
  Shield,
  Lock,
  Eye
} from 'lucide-react';

interface Activity {
  action: string;
  patient: string;
  time: string;
  type: string;
}

interface ProviderMetricsType {
  patientsToday: number;
  completedAppointments: number;
  upcomingAppointments: number;
  averageWaitTime: string;
  patientSatisfaction: number;
  pendingTasks: number;
}

interface AppointmentType {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface PatientType {
  id: string;
  name: string;
  lastVisit: string;
  reason: string;
}

interface ProviderDashboardTabProps {
  metrics: ProviderMetricsType;
  appointments: AppointmentType[];
  recentPatients: PatientType[];
}

const mockData = {
  totalPatients: 124,
  appointmentsToday: 18,
  pendingReviews: 5,
  messages: 32,
  recentActivity: [
    {
      action: 'Uploaded new lab results',
      patient: 'John Doe',
      time: '2 hours ago',
      type: 'Labs'
    },
    {
      action: 'Scheduled follow-up appointment',
      patient: 'Jane Smith',
      time: '3 hours ago',
      type: 'Appointment'
    },
    {
      action: 'Reviewed patient history',
      patient: 'Alice Johnson',
      time: '5 hours ago',
      type: 'Review'
    },
    {
      action: 'Sent prescription refill request',
      patient: 'Bob Williams',
      time: '1 day ago',
      type: 'Prescription'
    }
  ]
};

const ProviderDashboardTab: React.FC<ProviderDashboardTabProps> = ({ 
  metrics, 
  appointments, 
  recentPatients 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Patients Today"
          value={metrics.patientsToday}
          icon={<Users className="h-6 w-6" />}
          trend="+5%"
        />
        <MetricCard
          title="Completed Appointments"
          value={metrics.completedAppointments}
          icon={<Calendar className="h-6 w-6" />}
          trend="+12%"
        />
        <MetricCard
          title="Upcoming Appointments"
          value={metrics.upcomingAppointments}
          icon={<FileText className="h-6 w-6" />}
          trend="Stable"
        />
        <MetricCard
          title="Avg Wait Time"
          value={metrics.averageWaitTime}
          icon={<MessageCircle className="h-6 w-6" />}
          trend="-8%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-autheo-primary">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>

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
