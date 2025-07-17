import { performanceConfig } from '@/utils/production';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface WebVitals {
  CLS: number;
  FID: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    if (performanceConfig.enableMetrics) {
      this.initializeObserver();
      this.startMetricsCollection();
    }
  }

  private initializeObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || (entry as any).value || 0,
            timestamp: Date.now(),
            metadata: {
              entryType: entry.entryType,
              startTime: entry.startTime,
            },
          });
        }
      });

      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    });

    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Send to backend if sampling allows
    if (Math.random() < performanceConfig.sampleRate) {
      this.sendMetricToBackend(metric);
    }
  }

  getWebVitals(): Promise<Partial<WebVitals>> {
    return new Promise((resolve) => {
      const vitals: Partial<WebVitals> = {};

      // Collect Core Web Vitals
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          vitals.TTFB = navigation.responseStart - navigation.fetchStart;
          vitals.FCP = this.getFirstContentfulPaint();
          vitals.LCP = this.getLargestContentfulPaint();
        }
      }

      resolve(vitals);
    });
  }

  private getFirstContentfulPaint(): number {
    if (typeof window === 'undefined') return 0;
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    if (typeof window === 'undefined') return 0;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lastEntry = lcpEntries[lcpEntries.length - 1];
    return lastEntry ? lastEntry.startTime : 0;
  }

  measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();

    this.recordMetric({
      name: `component-render-${componentName}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      metadata: { type: 'component-render' },
    });

    return result;
  }

  measureAsyncOperation<T>(
    operationName: string,
    asyncOperation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return asyncOperation().finally(() => {
      const endTime = performance.now();
      this.recordMetric({
        name: `async-operation-${operationName}`,
        value: endTime - startTime,
        timestamp: Date.now(),
        metadata: { type: 'async-operation' },
      });
    });
  }

  private sendMetricToBackend(metric: PerformanceMetric): void {
    // Queue metric for batch sending
    if (performanceConfig.enableMetrics) {
      // In a real implementation, this would batch and send to your analytics service
      console.debug('[Performance]', metric);
    }
  }

  private startMetricsCollection(): void {
    if (typeof window === 'undefined') return;

    // Collect initial page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectInitialMetrics();
      }, 100);
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: Date.now(),
            metadata: { startTime: entry.startTime },
          });
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  private collectInitialMetrics(): void {
    if (typeof window === 'undefined') return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        'dns-lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'tcp-connection': navigation.connectEnd - navigation.connectStart,
        'request-response': navigation.responseEnd - navigation.requestStart,
        'dom-processing': navigation.domComplete - navigation.domLoading,
        'page-load': navigation.loadEventEnd - navigation.navigationStart,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        this.recordMetric({
          name,
          value,
          timestamp: Date.now(),
          metadata: { type: 'navigation-timing' },
        });
      });
    }
  }

  getMetricsSummary(): {
    totalMetrics: number;
    averagePageLoad: number;
    slowestOperations: PerformanceMetric[];
  } {
    const pageLoadMetrics = this.metrics.filter(m => m.name === 'page-load');
    const averagePageLoad = pageLoadMetrics.length > 0
      ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
      : 0;

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalMetrics: this.metrics.length,
      averagePageLoad,
      slowestOperations,
    };
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export default PerformanceMonitor;
