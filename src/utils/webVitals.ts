// Performance monitoring and Web Vitals tracking
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { logger } from '@/utils/logging';
import { isProduction } from '@/utils/production';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: PerformanceMetric[] = [];
  private reportingInterval: number = 30000; // 30 seconds

  public static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor();
    }
    return WebVitalsMonitor.instance;
  }

  public startMonitoring(): void {
    if (!isProduction() && !window.location.hostname.includes('localhost')) {
      return; // Only monitor in production or local development
    }

    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this)); // Interaction to Next Paint (replaces FID)
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Custom performance metrics
    this.measureResourceLoadTimes();
    this.measureRenderTimes();

    // Report metrics periodically
    setInterval(() => {
      this.reportMetrics();
    }, this.reportingInterval);
  }

  private handleMetric(metric: any): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'navigate'
    };

    this.metrics.push(performanceMetric);

    // Log poor performance metrics immediately
    if (metric.rating === 'poor') {
      logger.warn(`Poor Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        threshold: this.getThreshold(metric.name)
      });
    }

    // Log to production monitoring
    if (isProduction()) {
      this.sendToAnalytics(performanceMetric);
    }
  }

  private getThreshold(metricName: string): number {
    const thresholds = {
      CLS: 0.1,     // Cumulative Layout Shift
      INP: 200,     // Interaction to Next Paint (ms)
      FCP: 1800,    // First Contentful Paint (ms)
      LCP: 2500,    // Largest Contentful Paint (ms)
      TTFB: 800     // Time to First Byte (ms)
    };
    return thresholds[metricName as keyof typeof thresholds] || 0;
  }

  private measureResourceLoadTimes(): void {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Flag slow resources (>2s)
            if (resourceEntry.duration > 2000) {
              logger.warn('Slow resource detected', {
                resource: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize || 0
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private measureRenderTimes(): void {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            logger.performance(entry.name, entry.duration, {
              startTime: entry.startTime,
              entryType: 'measure'
            });
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }

  private reportMetrics(): void {
    if (this.metrics.length === 0) return;

    const summary = this.generateMetricsSummary();
    
    logger.info('Performance metrics summary', {
      period: '30s',
      metrics: summary,
      timestamp: new Date().toISOString()
    });

    // Clear reported metrics
    this.metrics = [];
  }

  private generateMetricsSummary() {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          poor: 0,
          good: 0
        };
      }

      const s = summary[metric.name];
      s.count++;
      s.total += metric.value;
      s.min = Math.min(s.min, metric.value);
      s.max = Math.max(s.max, metric.value);
      
      if (metric.rating === 'poor') s.poor++;
      if (metric.rating === 'good') s.good++;
    });

    // Calculate averages
    Object.keys(summary).forEach(key => {
      const s = summary[key];
      s.average = s.total / s.count;
      s.poorPercentage = (s.poor / s.count) * 100;
    });

    return summary;
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Send to production analytics service
    try {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silent fail for analytics
      });
    } catch {
      // Silent fail for analytics
    }
  }

  public measureCustomTiming(name: string, startMark: string, endMark: string): void {
    if ('performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
      } catch {
        // Silent fail if marks don't exist
      }
    }
  }

  public markEvent(name: string): void {
    if ('performance' in window) {
      performance.mark(name);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

// Initialize Web Vitals monitoring
export const webVitalsMonitor = WebVitalsMonitor.getInstance();

// Auto-start monitoring when module loads
if (typeof window !== 'undefined') {
  webVitalsMonitor.startMonitoring();
}