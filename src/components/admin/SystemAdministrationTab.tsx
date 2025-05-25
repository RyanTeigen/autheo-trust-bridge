
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import SystemMetricsGrid from './system-administration/SystemMetricsGrid';
import SystemServicesStatus from './system-administration/SystemServicesStatus';
import SystemMaintenanceCard from './system-administration/SystemMaintenanceCard';
import DataManagementCard from './system-administration/DataManagementCard';

const SystemAdministrationTab: React.FC = () => {
  const { toast } = useToast();

  const systemServices = [
    { name: 'API Gateway', status: 'healthy' as const, uptime: '99.9%', responseTime: '142ms' },
    { name: 'Database', status: 'healthy' as const, uptime: '100%', responseTime: '23ms' },
    { name: 'Authentication Service', status: 'healthy' as const, uptime: '99.8%', responseTime: '89ms' },
    { name: 'File Storage', status: 'warning' as const, uptime: '98.5%', responseTime: '234ms' },
    { name: 'Encryption Service', status: 'healthy' as const, uptime: '100%', responseTime: '45ms' },
  ];

  const systemMetrics = {
    cpuUsage: 67,
    memoryUsage: 72,
    diskUsage: 43,
    networkLoad: 28
  };

  const handleSystemAction = (action: string) => {
    toast({
      title: `${action} Initiated`,
      description: `System ${action.toLowerCase()} has been started. You will be notified when complete.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <SystemMetricsGrid systemMetrics={systemMetrics} />

      {/* System Services Status */}
      <SystemServicesStatus systemServices={systemServices} />

      {/* System Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemMaintenanceCard onSystemAction={handleSystemAction} />
        <DataManagementCard onSystemAction={handleSystemAction} />
      </div>
    </div>
  );
};

export default SystemAdministrationTab;
