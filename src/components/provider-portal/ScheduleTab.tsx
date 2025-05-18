
import React from 'react';
import ProviderCalendar from '@/components/provider/ProviderCalendar';
import { useToast } from '@/hooks/use-toast';

interface ScheduleTabProps {
  appointments: Array<{
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: string;
  }>;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ appointments }) => {
  const { toast } = useToast();
  
  const handleAction = () => {
    toast({
      title: "Feature in Development",
      description: "This provider feature will be available soon.",
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <ProviderCalendar 
        appointments={appointments} 
        onAction={handleAction} 
      />
    </div>
  );
};

export default ScheduleTab;
