
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  source: string;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  providersCount: number;
  patientsCount: number;
  adminCount: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  databaseConnections: number;
  memoryUsage: number;
}

interface AdminPortalContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemAlerts: SystemAlert[];
  dismissAlert: (id: string) => void;
  userMetrics: UserMetrics;
  systemHealth: SystemHealth;
}

const AdminPortalContext = createContext<AdminPortalContextType | undefined>(undefined);

// Mock data for admin portal
const mockSystemAlerts: SystemAlert[] = [
  {
    id: 'A1',
    type: 'warning',
    message: 'Database connection pool is at 85% capacity',
    timestamp: '5 min ago',
    source: 'Database Monitor'
  },
  {
    id: 'A2',
    type: 'info',
    message: 'Scheduled maintenance completed successfully',
    timestamp: '2 hours ago',
    source: 'System Maintenance'
  }
];

const mockUserMetrics: UserMetrics = {
  totalUsers: 1247,
  activeUsers: 342,
  newUsersToday: 12,
  providersCount: 89,
  patientsCount: 1158,
  adminCount: 4
};

const mockSystemHealth: SystemHealth = {
  status: 'healthy',
  uptime: '15 days, 4 hours',
  responseTime: 142,
  databaseConnections: 23,
  memoryUsage: 67
};

interface AdminPortalProviderProps {
  children: ReactNode;
}

export const AdminPortalProvider: React.FC<AdminPortalProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [systemAlerts, setSystemAlerts] = useState(mockSystemAlerts);

  const dismissAlert = (id: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const value = {
    activeTab,
    setActiveTab,
    systemAlerts,
    dismissAlert,
    userMetrics: mockUserMetrics,
    systemHealth: mockSystemHealth
  };

  return (
    <AdminPortalContext.Provider value={value}>
      {children}
    </AdminPortalContext.Provider>
  );
};

export const useAdminPortal = () => {
  const context = useContext(AdminPortalContext);
  if (context === undefined) {
    throw new Error('useAdminPortal must be used within an AdminPortalProvider');
  }
  return context;
};
