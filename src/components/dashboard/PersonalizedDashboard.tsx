
import React from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import DashboardWelcomeEnhanced from './DashboardWelcomeEnhanced';
import EnhancedQuickActions from './EnhancedQuickActions';
import ConsolidatedHealthOverview from './ConsolidatedHealthOverview';
import AppointmentsCard from './AppointmentsCard';
import MedicationRemindersCard from './MedicationRemindersCard';

interface PersonalizedDashboardProps {
  patientName?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  patientName = "Patient",
}) => {
  const { summary } = useHealthRecords();
  
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
      {/* Enhanced welcome section with actionable metrics */}
      <DashboardWelcomeEnhanced 
        patientName={patientName} 
        complianceScore={complianceScore} 
        appointmentsCount={defaultAppointments.length}
        unreadMessages={3}
      />
      
      {/* Enhanced quick actions */}
      <EnhancedQuickActions className="bg-slate-800 border-slate-700" />
      
      {/* Consolidated health overview (now includes atomic vitals) */}
      <ConsolidatedHealthOverview />
      
      {/* Appointments and medications in a consistent style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppointmentsCard appointments={defaultAppointments} />
        <MedicationRemindersCard medications={defaultMedications} />
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
