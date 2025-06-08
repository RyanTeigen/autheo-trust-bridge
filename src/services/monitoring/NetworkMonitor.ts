
import SystemMonitor from './SystemMonitor';

export class NetworkMonitor {
  private systemMonitor: SystemMonitor;

  constructor(systemMonitor: SystemMonitor) {
    this.systemMonitor = systemMonitor;
  }

  // Monitor network performance
  measureNetworkPerformance = (): void => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.systemMonitor.recordMetric(
        'performance',
        connection.downlink || 0,
        'mbps',
        {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        },
        'low'
      );
    }
  };

  // Start periodic network monitoring
  startPeriodicMonitoring(): void {
    // Monitor network performance every minute
    setInterval(() => {
      this.measureNetworkPerformance();
    }, 60000);
  }
}

export default NetworkMonitor;
