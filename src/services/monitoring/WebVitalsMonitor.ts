
import SystemMonitor from './SystemMonitor';

export class WebVitalsMonitor {
  private systemMonitor: SystemMonitor;

  constructor(systemMonitor: SystemMonitor) {
    this.systemMonitor = systemMonitor;
  }

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
      const fid = entries[0] as PerformanceEventTiming;
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
}

export default WebVitalsMonitor;
