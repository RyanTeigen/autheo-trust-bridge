
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PatientRecord } from '@/components/emr/AdvancedPatientSearch';
import { useProviderNotifications, ProviderNotificationData } from '@/hooks/useProviderNotifications';

// Define the types for our context
interface NotificationType {
  id: string;
  type: 'alert' | 'info';
  message: string;
  timestamp: string;
}

interface ProviderMetricsType {
  patientsToday: number;
  completedAppointments: number;
  upcomingAppointments: number;
  averageWaitTime: string;
  patientSatisfaction: number;
  pendingTasks: number;
}

interface AppointmentType {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface PatientType {
  id: string;
  name: string;
  lastVisit: string;
  reason: string;
}

interface ProviderPortalContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: ProviderNotificationData[];
  dismissNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  metrics: ProviderMetricsType;
  appointments: AppointmentType[];
  recentPatients: PatientType[];
  patientRecords: PatientRecord[];
  unreadNotificationCount: number;
  markAllNotificationsAsRead: () => void;
}

// Create the context
const ProviderPortalContext = createContext<ProviderPortalContextType | undefined>(undefined);

// Mock data for the Provider Portal
const mockNotifications: NotificationType[] = [
  { id: 'N1', type: 'alert', message: 'Lab results for patient John Doe require immediate review', timestamp: '10 min ago' },
  { id: 'N2', type: 'info', message: 'New patient referral received from Dr. Williams', timestamp: '25 min ago' },
];

const mockProviderMetrics: ProviderMetricsType = {
  patientsToday: 8,
  completedAppointments: 3,
  upcomingAppointments: 5,
  averageWaitTime: '12 min',
  patientSatisfaction: 92,
  pendingTasks: 4
};

const mockAppointments: AppointmentType[] = [
  { id: 'A1', patientName: 'John Doe', time: '09:00 AM', type: 'Follow-up', status: 'Checked In' },
  { id: 'A2', patientName: 'Jane Smith', time: '10:30 AM', type: 'New Patient', status: 'Scheduled' },
  { id: 'A3', patientName: 'Robert Johnson', time: '11:45 AM', type: 'Lab Results', status: 'Scheduled' },
  { id: 'A4', patientName: 'Emily Wilson', time: '01:15 PM', type: 'Annual Physical', status: 'Scheduled' },
  { id: 'A5', patientName: 'Michael Brown', time: '02:30 PM', type: 'Follow-up', status: 'Scheduled' },
];

const mockRecentPatients: PatientType[] = [
  { id: 'P12345', name: 'John Doe', lastVisit: '2025-05-10', reason: 'Follow-up' },
  { id: 'P23456', name: 'Jane Smith', lastVisit: '2025-05-08', reason: 'New Patient' },
  { id: 'P34567', name: 'Robert Johnson', lastVisit: '2025-05-05', reason: 'Lab Results' },
];

const mockPatientRecords: PatientRecord[] = [
  { id: 'P12345', name: 'John Doe', dob: '1985-06-15', mrn: 'MRN123456', lastVisit: '2025-05-10', insuranceProvider: 'BlueCross', primaryCareProvider: 'Dr. Smith', tags: ['Chronic Condition'] },
  { id: 'P23456', name: 'Jane Smith', dob: '1990-03-22', mrn: 'MRN234567', lastVisit: '2025-05-08', insuranceProvider: 'Aetna', primaryCareProvider: 'Dr. Johnson', tags: ['New Patient'] },
  { id: 'P34567', name: 'Robert Johnson', dob: '1975-11-30', mrn: 'MRN345678', lastVisit: '2025-05-05', insuranceProvider: 'UnitedHealth', primaryCareProvider: 'Dr. Williams', tags: ['Follow-up Required'] },
  { id: 'P45678', name: 'Emily Wilson', dob: '1982-09-18', mrn: 'MRN456789', lastVisit: '2025-05-01', insuranceProvider: 'Medicare', primaryCareProvider: 'Dr. Davis', tags: ['High Risk', 'Chronic Condition'] },
  { id: 'P56789', name: 'Michael Brown', dob: '1968-07-24', mrn: 'MRN567890', lastVisit: '2025-04-28', insuranceProvider: 'Cigna', primaryCareProvider: 'Dr. Brown', tags: ['Specialist Referral'] },
];

// Create the Provider component
interface ProviderPortalProviderProps {
  children: ReactNode;
}

export const ProviderPortalProvider: React.FC<ProviderPortalProviderProps> = ({ children }) => {
  // Updated default tab to match new structure
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    notifications, 
    unreadCount, 
    removeNotification, 
    markAllAsRead,
    markAsRead
  } = useProviderNotifications();

  const dismissNotification = (id: string) => {
    removeNotification(id);
  };
  
  const value = {
    activeTab,
    setActiveTab,
    notifications,
    dismissNotification,
    markNotificationAsRead: markAsRead,
    metrics: mockProviderMetrics,
    appointments: mockAppointments,
    recentPatients: mockRecentPatients,
    patientRecords: mockPatientRecords,
    unreadNotificationCount: unreadCount,
    markAllNotificationsAsRead: markAllAsRead,
  };
  
  return (
    <ProviderPortalContext.Provider value={value}>
      {children}
    </ProviderPortalContext.Provider>
  );
};

// Create the hook to use the context
export const useProviderPortal = () => {
  const context = useContext(ProviderPortalContext);
  if (context === undefined) {
    throw new Error('useProviderPortal must be used within a ProviderPortalProvider');
  }
  return context;
};
