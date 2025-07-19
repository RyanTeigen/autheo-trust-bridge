
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/dashboard/PageHeader';
import Calendar from '@/components/scheduling/Calendar';
import PatientAppointmentForm from '@/components/scheduling/PatientAppointmentForm';
import { useAppointments } from '@/hooks/useAppointments';

const SchedulingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { refreshAppointments } = useAppointments();

  const handleAppointmentSuccess = () => {
    // Refresh appointments after successful submission
    refreshAppointments();
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Scheduling"
        description="View your appointments and request new ones"
      />
      
      <div className="bg-slate-800 border-slate-700 text-slate-100 rounded-lg shadow-md">
        <div className="border-b border-slate-700 bg-slate-700/30 p-6">
          <h2 className="text-2xl font-semibold leading-none tracking-tight text-autheo-primary">
            Your Healthcare Appointments
          </h2>
          <p className="text-sm text-slate-300 mt-1.5">
            Manage your appointments and request new ones
          </p>
          
          <Tabs defaultValue="calendar" className="w-full mt-4">
            <TabsList className="bg-slate-700/50">
              <TabsTrigger 
                value="calendar" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                My Appointments
              </TabsTrigger>
              <TabsTrigger 
                value="request" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                Request Appointment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-6 px-6 pb-6">
              <Calendar 
                onDateSelect={setSelectedDate}
                className="bg-slate-800 border-slate-700"
              />
            </TabsContent>
            
            <TabsContent value="request" className="mt-6 px-6 pb-6">
              <PatientAppointmentForm 
                initialDate={selectedDate}
                onSuccess={handleAppointmentSuccess}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SchedulingPage;
