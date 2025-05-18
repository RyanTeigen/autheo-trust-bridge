
import React from 'react';
import ProviderMetrics from '@/components/provider/ProviderMetrics';
import ProviderDashboard from '@/components/provider/ProviderDashboard';
import { useToast } from '@/hooks/use-toast';

// Define types for props
interface ProviderDashboardTabProps {
  metrics: {
    patientsToday: number;
    completedAppointments: number;
    upcomingAppointments: number;
    averageWaitTime: string;
    patientSatisfaction: number;
    pendingTasks: number;
  };
  appointments: Array<{
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: string;
  }>;
  recentPatients: Array<{
    id: string;
    name: string;
    lastVisit: string;
    reason: string;
  }>;
}

const ProviderDashboardTab: React.FC<ProviderDashboardTabProps> = ({ 
  metrics, 
  appointments, 
  recentPatients 
}) => {
  const { toast } = useToast();
  
  const handleSelectPatient = (patientId: string) => {
    toast({
      title: "Patient Selected",
      description: `Navigating to patient record: ${patientId}`,
    });
  };

  const handleAction = () => {
    toast({
      title: "Feature in Development",
      description: "This provider feature will be available soon.",
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <ProviderMetrics metrics={metrics} />
      <ProviderDashboard 
        appointments={appointments} 
        recentPatients={recentPatients}
        onSelectPatient={handleSelectPatient}
        onAction={handleAction}
      />
    </div>
  );
};

export default ProviderDashboardTab;
