
import React from 'react';
import QuickActions from './QuickActions';
import HealthRecordsOverview from '../health-records/HealthRecordsOverview';
import DashboardWelcome from './DashboardWelcome';
import HealthMetricsCard from './HealthMetricsCard';
import AppointmentsCard from './AppointmentsCard';
import MedicationRemindersCard from './MedicationRemindersCard';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

interface PersonalizedDashboardProps {
  patientName?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  patientName = "Patient",
}) => {
  const { summary, healthMetrics } = useHealthRecords();
  
  // Default appointments
  const defaultAppointments = [
    {
      id: '1',
      provider: 'Dr. Sarah Johnson',
      date: 'May 25, 2025',
      time: '10:30 AM',
      type: 'Follow-up',
      location: 'Main Clinic'
    },
    {
      id: '2',
      provider: 'Dr. Michael Lee',
      date: 'Jun 12, 2025',
      time: '2:15 PM',
      type: 'Consultation',
      location: 'Virtual'
    }
  ];
  
  // Default medications
  const defaultMedications = [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      nextDose: 'Today, 8:00 PM'
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      nextDose: 'Tomorrow, 8:00 AM'
    }
  ];
  
  // Mock compliance score
  const complianceScore = 92;

  return (
    <div className="space-y-6">
      <DashboardWelcome patientName={patientName} />
      
      <QuickActions className="bg-slate-800/50" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthMetricsCard 
          metrics={healthMetrics} 
          healthRecords={summary} 
          complianceScore={complianceScore}
        />
        
        <HealthRecordsOverview />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppointmentsCard appointments={defaultAppointments} />
        <MedicationRemindersCard medications={defaultMedications} />
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
