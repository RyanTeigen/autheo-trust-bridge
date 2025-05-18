
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ActivitySquare, 
  ClipboardList, 
  Clock,
  Calendar,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  progress?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, description, progress, trend }) => {
  return (
    <Card className="bg-slate-800/70 border-slate-700/70">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
          <div className="p-1.5 bg-slate-700/50 rounded-full">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-autheo-primary">{value}</div>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-slate-400 mt-1">{progress}% complete</p>
          </div>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
            <span className="text-xs text-slate-400 ml-1">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ProviderMetricsProps {
  metrics: {
    patientsToday: number;
    completedAppointments: number;
    upcomingAppointments: number;
    averageWaitTime: string;
    patientSatisfaction: number;
    pendingTasks: number;
  };
}

const ProviderMetrics: React.FC<ProviderMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Patients Today"
        value={metrics.patientsToday}
        icon={<UserCheck className="h-4 w-4 text-autheo-primary" />}
        trend={{ value: 5, isPositive: true }}
      />
      <MetricCard
        title="Completed Appointments"
        value={metrics.completedAppointments}
        icon={<ActivitySquare className="h-4 w-4 text-green-400" />}
        progress={Math.round((metrics.completedAppointments / (metrics.completedAppointments + metrics.upcomingAppointments)) * 100)}
      />
      <MetricCard
        title="Upcoming"
        value={metrics.upcomingAppointments}
        icon={<Calendar className="h-4 w-4 text-blue-400" />}
        description="Scheduled today"
      />
      <MetricCard
        title="Avg Wait Time"
        value={metrics.averageWaitTime}
        icon={<Clock className="h-4 w-4 text-amber-400" />}
        trend={{ value: 3, isPositive: false }}
      />
      <MetricCard
        title="Patient Satisfaction"
        value={`${metrics.patientSatisfaction}%`}
        icon={<UserCheck className="h-4 w-4 text-green-400" />}
        progress={metrics.patientSatisfaction}
      />
      <MetricCard
        title="Pending Tasks"
        value={metrics.pendingTasks}
        icon={<ClipboardList className="h-4 w-4 text-red-400" />}
        description="Tasks requiring attention"
      />
    </div>
  );
};

export default ProviderMetrics;
