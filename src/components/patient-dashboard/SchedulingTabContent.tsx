
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Calendar from '@/components/scheduling/Calendar';
import PatientAppointmentForm from '@/components/scheduling/PatientAppointmentForm';
import ConsentPreferencesTab from './ConsentPreferencesTab';
import { useAppointments } from '@/hooks/useAppointments';

const SchedulingTabContent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { refreshAppointments } = useAppointments();

  const handleAppointmentSuccess = () => {
    // Refresh appointments after successful submission
    refreshAppointments();
  };
  
  return (
    <div className="bg-slate-800 border-slate-700 text-slate-100 rounded-lg shadow-md">
      <div className="border-b border-slate-700 bg-slate-700/30 p-6">
        <h2 className="text-2xl font-semibold leading-none tracking-tight text-autheo-primary">
          Appointments & Scheduling
        </h2>
        <p className="text-sm text-slate-300 mt-1.5">
          View your appointments, request new ones, and manage your scheduling preferences
        </p>
      </div>
      
      <div className="p-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50 border-slate-600">
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
            <TabsTrigger 
              value="consent" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
            >
              Consent Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
            <Calendar
              onDateSelect={setSelectedDate}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </TabsContent>
          
          <TabsContent value="request" className="mt-6">
            <PatientAppointmentForm
              initialDate={selectedDate}
              onSuccess={handleAppointmentSuccess}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </TabsContent>
          
          <TabsContent value="consent" className="mt-6">
            <ConsentPreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchedulingTabContent;
