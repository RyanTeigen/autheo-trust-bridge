
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { performanceConfig, debugLog } from '@/utils/production';

export class ApplicationPerformanceMonitor {
  private static instance: ApplicationPerformanceMonitor;
  private systemMonitor: SystemMonitor;
  private observer?: PerformanceObserver;
  private isMonitoring: boolean = false;

  public static getInstance(): ApplicationPerformanceMonitor {
    if (!ApplicationPerformanceMonitor.instance) {
      ApplicationPerformanceMonitor.instance = new ApplicationPerformanceMonitor();
    }
    return ApplicationPerformanceMonitor.instance;
  }

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
  }

  public startMonitoring(): void {
    if (!performanceConfig.enableMetrics || this.isMonitoring) return;

    this.isMonitoring = true;
    this.initializePerformanceObserver();
    this.startResourceMonitoring();
    this.startNavigationMonitoring();
    
    debugLog('Application performance monitoring started');
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.observer) {
      this.observer.disconnect();
    }
    debugLog('Application performance monitoring stopped');
  }

  private initializePerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => this.processPerformanceEntry(entry));
      });

      this.observer.observe({
        entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      });
    } catch (error) {
      debugLog('Failed to initialize PerformanceObserver', error);
    }
  }

  private async processPerformanceEntry(entry: PerformanceEntry): Promise<void> {
    try {
      const context = {
        name: entry.name,
        entryType: entry.entryType,
        startTime: entry.startTime,
        duration: entry.duration,
        url: window.location.pathname
      };

      // Process different types of performance entries
      switch (entry.entryType) {
        case 'navigation':
          await this.processNavigationEntry(entry as PerformanceNavigationTiming, context);
          break;
        case 'resource':
          await this.processResourceEntry(entry as PerformanceResourceTiming, context);
          break;
        case 'paint':
          await this.processPaintEntry(entry, context);
          break;
        case 'largest-contentful-paint':
          await this.processLCPEntry(entry, context);
          break;
        case 'first-input':
          await this.processFIDEntry(entry as PerformanceEventTiming, context);
          break;
        case 'layout-shift':
          await this.processCLSEntry(entry as any, context);
          break;
      }
    } catch (error) {
      debugLog('Failed to process performance entry', error);
    }
  }

  private async processNavigationEntry(
    entry: PerformanceNavigationTiming, 
    context: Record<string, any>
  ): Promise<void> {
    // Page load time
    const pageLoadTime = entry.loadEventEnd - entry.fetchStart;
    await this.systemMonitor.recordMetric(
      'performance',
      pageLoadTime,
      'ms',
      { ...context, metric: 'page_load_time' },
      pageLoadTime > 3000 ? 'high' : pageLoadTime > 1000 ? 'medium' : 'low'
    );

    // DOM content loaded time
    const domContentLoadedTime = entry.domContentLoadedEventEnd - entry.fetchStart;
    await this.systemMonitor.recordMetric(
      'performance',
      domContentLoadedTime,
      'ms',
      { ...context, metric: 'dom_content_loaded' },
      'low'
    );
  }

  private async processResourceEntry(
    entry: PerformanceResourceTiming, 
    context: Record<string, any>
  ): Promise<void> {
    const resourceType = this.getResourceType(entry.name);
    const transferSize = entry.transferSize || 0;
    const loadTime = entry.responseEnd - entry.requestStart;

    await this.systemMonitor.recordMetric(
      'performance',
      transferSize,
      'bytes',
      { ...context, resourceType, loadTime, metric: 'resource_size' },
      transferSize > 500000 ? 'medium' : 'low' // 500KB threshold
    );

    if (loadTime > 0) {
      await this.systemMonitor.recordMetric(
        'performance',
        loadTime,
        'ms',
        { ...context, resourceType, transferSize, metric: 'resource_load_time' },
        loadTime > 2000 ? 'medium' : 'low'
      );
    }
  }

  private async processPaintEntry(entry: PerformanceEntry, context: Record<string, any>): Promise<void> {
    await this.systemMonitor.recordMetric(
      'performance',
      entry.startTime,
      'ms',
      { ...context, metric: entry.name.replace('-', '_') },
      entry.startTime > 1000 ? 'medium' : 'low'
    );
  }

  private async processLCPEntry(entry: PerformanceEntry, context: Record<string, any>): Promise<void> {
    await this.systemMonitor.recordMetric(
      'performance',
      entry.startTime,
      'ms',
      { ...context, metric: 'largest_contentful_paint' },
      entry.startTime > 2500 ? 'high' : entry.startTime > 1000 ? 'medium' : 'low'
    );
  }

  private async processFIDEntry(entry: PerformanceEventTiming, context: Record<string, any>): Promise<void> {
    const delay = entry.processingStart - entry.startTime;
    await this.systemMonitor.recordMetric(
      'performance',
      delay,
      'ms',
      { ...context, metric: 'first_input_delay' },
      delay > 100 ? 'high' : delay > 50 ? 'medium' : 'low'
    );
  }

  private async processCLSEntry(entry: any, context: Record<string, any>): Promise<void> {
    if (!entry.hadRecentInput) {
      await this.systemMonitor.recordMetric(
        'performance',
        entry.value,
        'score',
        { ...context, metric: 'cumulative_layout_shift' },
        entry.value > 0.25 ? 'high' : entry.value > 0.1 ? 'medium' : 'low'
      );
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    return 'other';
  }

  private startResourceMonitoring(): void {
    // Monitor bundle sizes periodically
    setInterval(() => {
      this.monitorBundleSizes();
    }, 60000); // Every minute
  }

  private startNavigationMonitoring(): void {
    // Monitor navigation performance
    window.addEventListener('beforeunload', () => {
      this.recordSessionMetrics();
    });
  }

  private async monitorBundleSizes(): Promise<void> {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      
      let totalJSSize = 0;
      jsResources.forEach(resource => {
        totalJSSize += resource.transferSize || 0;
      });

      await this.systemMonitor.recordMetric(
        'performance',
        totalJSSize,
        'bytes',
        { metric: 'total_js_bundle_size' },
        totalJSSize > 1000000 ? 'medium' : 'low' // 1MB threshold
      );
    } catch (error) {
      debugLog('Failed to monitor bundle sizes', error);
    }
  }

  private async recordSessionMetrics(): Promise<void> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const sessionDuration = Date.now() - navigation.fetchStart;

      await this.systemMonitor.recordMetric(
        'usage',
        sessionDuration,
        'ms',
        { metric: 'session_duration' },
        'low'
      );
    } catch (error) {
      debugLog('Failed to record session metrics', error);
    }
  }
}

export default ApplicationPerformanceMonitor;
