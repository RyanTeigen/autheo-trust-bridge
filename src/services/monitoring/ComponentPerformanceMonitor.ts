
import SystemMonitor from './SystemMonitor';

export class ComponentPerformanceMonitor {
  private systemMonitor: SystemMonitor;

  constructor(systemMonitor: SystemMonitor) {
    this.systemMonitor = systemMonitor;
  }

  // Monitor React component render times
  measureComponentRender = async (
    componentName: string,
    renderFunction: () => void | Promise<void>
  ): Promise<void> => {
    const startTime = performance.now();
    
    try {
      await renderFunction();
    } finally {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      await this.systemMonitor.recordMetric(
        'performance',
        renderTime,
        'ms',
        { 
          component: componentName,
          type: 'render'
        },
        renderTime > 100 ? 'medium' : 'low'
      );
    }
  };
}

export default ComponentPerformanceMonitor;
