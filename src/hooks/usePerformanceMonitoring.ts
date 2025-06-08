
import { useEffect, useCallback } from 'react';
import { useSystemMonitoring } from './useSystemMonitoring';
import { performanceConfig } from '@/utils/production';

export const usePerformanceMonitoring = () => {
  const { systemMonitor } = useSystemMonitoring();

  // Monitor Core Web Vitals
  const measureWebVitals = useCallback(() => {
    if (!performanceConfig.enableMetrics) return;

    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            systemMonitor?.recordMetric(
              'performance',
              lcp.startTime,
              'ms',
              { metric: 'LCP', url: window.location.pathname },
              lcp.startTime > 2500 ? 'high' : lcp.startTime > 1000 ? 'medium' : 'low'
            );
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          // Silent fail
        }
      }
    };

    // First Input Delay (FID)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fid = entries[0] as PerformanceEventTiming;
            const delay = fid.processingStart - fid.startTime;
            systemMonitor?.recordMetric(
              'performance',
              delay,
              'ms',
              { metric: 'FID', url: window.location.pathname },
              delay > 100 ? 'high' : delay > 50 ? 'medium' : 'low'
            );
          });
          observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          // Silent fail
        }
      }
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            systemMonitor?.recordMetric(
              'performance',
              clsValue,
              'score',
              { metric: 'CLS', url: window.location.pathname },
              clsValue > 0.25 ? 'high' : clsValue > 0.1 ? 'medium' : 'low'
            );
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          // Silent fail
        }
      }
    };

    observeLCP();
    observeFID();
    observeCLS();
  }, [systemMonitor]);

  // Monitor memory usage
  const measureMemoryUsage = useCallback(() => {
    if (!performanceConfig.enableMetrics) return;
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      systemMonitor?.recordMetric(
        'performance',
        memoryUsage * 100,
        'percent',
        {
          usedHeapSize: memory.usedJSHeapSize,
          totalHeapSize: memory.totalJSHeapSize,
          heapSizeLimit: memory.jsHeapSizeLimit,
          url: window.location.pathname
        },
        memoryUsage > 0.8 ? 'high' : memoryUsage > 0.6 ? 'medium' : 'low'
      );
    }
  }, [systemMonitor]);

  // Monitor bundle size and resource loading
  const measureResourceTiming = useCallback(() => {
    if (!performanceConfig.enableMetrics) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    // Track JavaScript bundle sizes
    jsResources.forEach(resource => {
      systemMonitor?.recordMetric(
        'performance',
        resource.transferSize || 0,
        'bytes',
        { 
          resource: resource.name,
          type: 'javascript',
          loadTime: resource.responseEnd - resource.requestStart
        },
        'low'
      );
    });

    // Track CSS bundle sizes
    cssResources.forEach(resource => {
      systemMonitor?.recordMetric(
        'performance',
        resource.transferSize || 0,
        'bytes',
        { 
          resource: resource.name,
          type: 'css',
          loadTime: resource.responseEnd - resource.requestStart
        },
        'low'
      );
    });
  }, [systemMonitor]);

  useEffect(() => {
    measureWebVitals();
    measureResourceTiming();
    
    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(measureMemoryUsage, 30000);
    
    return () => {
      clearInterval(memoryInterval);
    };
  }, [measureWebVitals, measureMemoryUsage, measureResourceTiming]);

  return {
    measureWebVitals,
    measureMemoryUsage,
    measureResourceTiming
  };
};
