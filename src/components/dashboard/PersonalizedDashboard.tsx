
import React from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useMedications } from '@/hooks/useMedications';
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
  const { upcomingAppointments, loading: appointmentsLoading } = useAppointments();
  const { medications, loading: medicationsLoading } = useMedications();
  
  // Mock compliance score
  const complianceScore = 92;

  return (
    <div className="space-y-6">
      {/* Enhanced welcome section with actionable metrics */}
      <DashboardWelcomeEnhanced 
        patientName={patientName} 
        complianceScore={complianceScore} 
        appointmentsCount={upcomingAppointments.length}
        unreadMessages={3}
      />
      
      {/* Priority Section: Immediate Health Actions - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppointmentsCard 
          appointments={upcomingAppointments} 
          loading={appointmentsLoading}
        />
        <MedicationRemindersCard 
          medications={medications} 
          loading={medicationsLoading}
        />
      </div>
      
      {/* Enhanced quick actions */}
      <EnhancedQuickActions className="bg-slate-800 border-slate-700" />
      
      {/* Consolidated health overview (now includes atomic vitals) */}
      <ConsolidatedHealthOverview />
    </div>
  );
};

export default PersonalizedDashboard;
