
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Calendar from '@/components/scheduling/Calendar';
import AppointmentForm from '@/components/scheduling/AppointmentForm';

// Sample appointment data
const sampleAppointments = [
  {
    id: 'apt-1',
    title: 'Annual Check-up',
    date: new Date(2025, 4, 10), // May 10, 2025
    time: '10:00 AM',
    provider: 'Dr. Sarah Johnson',
    type: 'Annual Physical',
    location: 'Main Hospital, Room 203'
  },
  {
    id: 'apt-2',
    title: 'Follow-up Appointment',
    date: new Date(2025, 4, 12), // May 12, 2025
    time: '2:30 PM',
    provider: 'Dr. James Wilson',
    type: 'Follow-up',
    location: 'Cardiology Clinic'
  },
  {
    id: 'apt-3',
    title: 'Lab Work',
    date: new Date(2025, 4, 15), // May 15, 2025
    time: '8:30 AM',
    provider: 'Metro Lab Services',
    type: 'Lab Work',
    location: 'Metro Lab, 1st Floor'
  },
  {
    id: 'apt-4',
    title: 'Vaccination',
    date: new Date(2025, 4, 20), // May 20, 2025
    time: '11:00 AM',
    provider: 'Nurse Thompson',
    type: 'Vaccination',
    location: 'Community Health Center'
  },
  {
    id: 'apt-5',
    title: 'Mental Health Consultation',
    date: new Date(2025, 4, 25), // May 25, 2025
    time: '3:00 PM',
    provider: 'Dr. Emily Rodriguez',
    type: 'Mental Health',
    location: 'Behavioral Health Center'
  },
  {
    id: 'apt-6',
    title: 'Specialist Appointment',
    date: new Date(2025, 4, 18), // May 18, 2025
    time: '1:15 PM',
    provider: 'Dr. Michael Chen',
    type: 'Consultation',
    location: 'Specialty Clinic, Suite 400'
  },
  // Add current day appointment
  {
    id: 'apt-7',
    title: 'Today\'s Appointment',
    date: new Date(), 
    time: '9:00 AM',
    provider: 'Dr. Lisa Wong',
    type: 'Follow-up',
    location: 'Telehealth'
  }
];

const SchedulingTabContent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="bg-slate-800 border-slate-700 text-slate-100 rounded-lg shadow-md">
      <div className="border-b border-slate-700 bg-slate-700/30 p-6">
        <h2 className="text-2xl font-semibold leading-none tracking-tight text-autheo-primary">
          Calendar & Appointments
        </h2>
        <p className="text-sm text-slate-300 mt-1.5">
          View your calendar and schedule new appointments
        </p>
        
        <Tabs defaultValue="calendar" className="w-full mt-4">
          <TabsList className="bg-slate-700/50">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
            >
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
            >
              Schedule Appointment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6 px-6 pb-6">
            <Calendar 
              events={sampleAppointments} 
              onDateSelect={setSelectedDate}
              className="bg-slate-800 border-slate-700"
            />
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6 px-6 pb-6">
            <AppointmentForm 
              initialDate={selectedDate}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchedulingTabContent;
