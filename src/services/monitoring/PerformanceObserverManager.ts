
import SystemMonitor from './SystemMonitor';

export class PerformanceObserverManager {
  private systemMonitor: SystemMonitor;
  private performanceObserver?: PerformanceObserver;

  constructor(systemMonitor: SystemMonitor) {
    this.systemMonitor = systemMonitor;
    this.initializePerformanceObserver();
  }

  private initializePerformanceObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.systemMonitor.recordMetric(
            'performance',
            entry.duration || entry.startTime,
            'ms',
            {
              name: entry.name,
              entryType: entry.entryType
            },
            'low'
          );
        });
      });

      try {
        this.performanceObserver.observe({ 
          entryTypes: ['navigation', 'resource', 'paint', 'mark', 'measure'] 
        });
      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error);
      }
    }
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export default PerformanceObserverManager;
