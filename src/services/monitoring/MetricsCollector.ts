
import { SystemMetric, MonitoringThresholds } from './MonitoringTypes';
import { AlertManager } from './AlertManager';

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: SystemMetric[] = [];
  private alertManager: AlertManager;
  
  private thresholds: MonitoringThresholds = {
    errorRate: 0.05, // 5% error rate threshold
    responseTime: 2000, // 2 second response time threshold
    memoryUsage: 0.8, // 80% memory usage threshold
    diskUsage: 0.9, // 90% disk usage threshold
    failedLogins: 5, // 5 failed login attempts threshold
  };

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private constructor() {
    this.alertManager = AlertManager.getInstance();
  }

  public async recordMetric(
    metricType: SystemMetric['metricType'],
    value: number,
    unit: string,
    context?: Record<string, any>,
    severity: SystemMetric['severity'] = 'low'
  ): Promise<void> {
    try {
      const metric: SystemMetric = {
        id: crypto.randomUUID(),
        metricType,
        value,
        unit,
        timestamp: new Date().toISOString(),
        context,
        severity
      };

      this.metrics.push(metric);
      
      // Keep only last 1000 metrics in memory
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Store in database (placeholder)
      await this.persistMetric(metric);

      // Check if metric triggers any alerts
      await this.checkMetricThresholds(metric);

    } catch (error) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to record metric:', error);
      }
    }
  }

  public getRecentMetrics(type: SystemMetric['metricType'] | 'all', timeWindow: number): SystemMetric[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.filter(m => {
      const metricTime = new Date(m.timestamp).getTime();
      return metricTime > cutoff && (type === 'all' || m.metricType === type);
    });
  }

  public getMetricsByType(type: SystemMetric['metricType']): SystemMetric[] {
    return this.metrics.filter(m => m.metricType === type);
  }

  public getAverageValue(type: SystemMetric['metricType'], timeWindow?: number): number {
    let filteredMetrics = this.metrics.filter(m => m.metricType === type);
    
    if (timeWindow) {
      filteredMetrics = this.getRecentMetrics(type, timeWindow);
    }
    
    if (filteredMetrics.length === 0) return 0;
    
    const total = filteredMetrics.reduce((sum, m) => sum + m.value, 0);
    return total / filteredMetrics.length;
  }

  private async persistMetric(metric: SystemMetric): Promise<void> {
    try {
      // In a real implementation, this would save to a metrics database
      if (import.meta.env.DEV) {
        console.log('Persisting metric:', metric);
      }
    } catch (error) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to persist metric:', error);
      }
    }
  }

  private async checkMetricThresholds(metric: SystemMetric): Promise<void> {
    try {
      // Check response time threshold
      if (metric.metricType === 'performance' && metric.unit === 'ms') {
        if (metric.value > this.thresholds.responseTime) {
          await this.alertManager.createAlert(
            'performance',
            'medium',
            `Slow response time detected: ${metric.value}ms`,
            { metric, threshold: this.thresholds.responseTime }
          );
        }
      }

      // Check error rate threshold
      if (metric.metricType === 'error') {
        const recentErrors = this.getRecentMetrics('error', 300000); // Last 5 minutes
        const errorRate = recentErrors.length / 300; // errors per second

        if (errorRate > this.thresholds.errorRate) {
          await this.alertManager.createAlert(
            'system',
            'high',
            `High error rate detected: ${errorRate.toFixed(2)} errors/second`,
            { errorRate, recentErrorCount: recentErrors.length }
          );
        }
      }
    } catch (error) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to check metric thresholds:', error);
      }
    }
  }

  public updateThresholds(newThresholds: Partial<MonitoringThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    
    if (import.meta.env.DEV) {
      console.log('Updated monitoring thresholds:', this.thresholds);
    }
  }

  public getThresholds(): MonitoringThresholds {
    return { ...this.thresholds };
  }
}

export default MetricsCollector;
