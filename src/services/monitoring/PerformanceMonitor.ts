
import SystemMonitor from './SystemMonitor';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private systemMonitor: SystemMonitor;
  private performanceObserver?: PerformanceObserver;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.initializePerformanceObserver();
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

  // Monitor API call performance
  measureAPICall = async <T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let statusCode = 200;
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      statusCode = 500;
      throw error;
    } finally {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      await this.systemMonitor.recordAPIResponse(
        endpoint,
        method,
        responseTime,
        statusCode
      );
    }
  };

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

  // Monitor Core Web Vitals
  measureWebVitals = (): void => {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      this.systemMonitor.recordMetric(
        'performance',
        lcp.startTime,
        'ms',
        { metric: 'LCP' },
        lcp.startTime > 2500 ? 'high' : lcp.startTime > 1000 ? 'medium' : 'low'
      );
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const fid = entries[0];
      const delay = fid.processingStart - fid.startTime;
      this.systemMonitor.recordMetric(
        'performance',
        delay,
        'ms',
        { metric: 'FID' },
        delay > 100 ? 'high' : delay > 50 ? 'medium' : 'low'
      );
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.systemMonitor.recordMetric(
        'performance',
        clsValue,
        'score',
        { metric: 'CLS' },
        clsValue > 0.25 ? 'high' : clsValue > 0.1 ? 'medium' : 'low'
      );
    });
  };

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

  private observeMetric(
    entryType: string, 
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        observer.observe({ entryTypes: [entryType] });
      } catch (error) {
        console.warn(`Cannot observe ${entryType}:`, error);
      }
    }
  }

  // Start periodic monitoring
  startMonitoring(): void {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.measureMemoryUsage();
    }, 30000);

    // Monitor network performance every minute
    setInterval(() => {
      this.measureNetworkPerformance();
    }, 60000);

    // Initialize web vitals monitoring
    this.measureWebVitals();
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export default PerformanceMonitor;
