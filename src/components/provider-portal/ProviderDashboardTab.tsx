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

interface MockData {
  totalPatients: number;
  appointmentsToday: number;
  pendingReviews: number;
  messages: number;
  recentActivity: Activity[];
}

const mockData: MockData = {
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

const ProviderDashboardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Patients"
          value={mockData.totalPatients}
          icon={<Users className="h-6 w-6" />}
          trend="+12%"
        />
        <MetricCard
          title="Appointments Today"
          value={mockData.appointmentsToday}
          icon={<Calendar className="h-6 w-6" />}
          trend="+5%"
        />
        <MetricCard
          title="Pending Reviews"
          value={mockData.pendingReviews}
          icon={<FileText className="h-6 w-6" />}
          trend="-8%"
        />
        <MetricCard
          title="Messages"
          value={mockData.messages}
          icon={<MessageCircle className="h-6 w-6" />}
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.patient}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Post-Quantum Encryption</span>
                </div>
                <Badge variant="default" className="bg-green-600">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">HIPAA Compliance</span>
                </div>
                <Badge variant="default" className="bg-blue-600">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Audit Logs</span>
                </div>
                <Badge variant="secondary">Monitoring</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboardTab;
