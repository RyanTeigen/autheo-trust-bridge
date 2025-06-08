
import SystemMonitor from './SystemMonitor';

export class MemoryMonitor {
  private systemMonitor: SystemMonitor;

  constructor(systemMonitor: SystemMonitor) {
    this.systemMonitor = systemMonitor;
  }

  // Monitor memory usage
  measureMemoryUsage = async (): Promise<void> => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      await this.systemMonitor.recordMetric(
        'performance',
        memoryUsage * 100,
        'percent',
        {
          usedHeapSize: memory.usedJSHeapSize,
          totalHeapSize: memory.totalJSHeapSize,
          heapSizeLimit: memory.jsHeapSizeLimit
        },
        memoryUsage > 0.8 ? 'high' : memoryUsage > 0.6 ? 'medium' : 'low'
      );
    }
  };

  // Start periodic memory monitoring
  startPeriodicMonitoring(): void {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.measureMemoryUsage();
    }, 30000);
  }
}

export default MemoryMonitor;
