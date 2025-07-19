
import React, { useState } from 'react';
import ProviderCalendar from '@/components/provider/ProviderCalendar';
import AppointmentForm from '@/components/scheduling/AppointmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleCreateAppointment = () => {
    setIsDialogOpen(true);
  };

  const handleAppointmentSuccess = () => {
    setIsDialogOpen(false);
    toast({
      title: "Appointment Created",
      description: "The appointment has been successfully scheduled.",
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ProviderCalendar 
          appointments={appointments} 
          onAction={handleCreateAppointment} 
        />
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-autheo-primary">Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            onSuccess={handleAppointmentSuccess}
            className="bg-slate-800 border-slate-700 text-slate-100"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleTab;
