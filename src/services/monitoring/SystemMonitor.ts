import { supabase } from '@/integrations/supabase/client';
import { 
  validateDataIntegrity, 
  sanitizeString 
} from '@/utils/validation';
import { 
  asyncHandler, 
  handleSupabaseError, 
  ValidationError,
  logError 
} from '@/utils/errorHandling';
import { requireAuthentication } from '@/utils/security';
import LoadingStates from '@/components/ux/LoadingStates';

export interface SystemMetric {
  id: string;
  metricType: 'performance' | 'security' | 'usage' | 'error' | 'health';
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  alertType: 'system' | 'security' | 'performance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

// Add new interfaces for UX and healthcare events
export interface UXEvent {
  id: string;
  type: 'ux_event';
  timestamp: string;
  event_type: 'interaction' | 'navigation' | 'error' | 'accessibility';
  data: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  user_agent: string;
  url: string;
}

export interface HealthcareEvent {
  id: string;
  type: 'healthcare_event';
  timestamp: string;
  event_type: 'vital_recorded' | 'medication_taken' | 'alert_triggered' | 'appointment_scheduled';
  patient_id: string;
  data: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  compliance_relevant: boolean;
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private metrics: SystemMetric[] = [];
  private alerts: Alert[] = [];
  private uxEvents: UXEvent[] = []; // Separate storage for UX events
  private healthcareEvents: HealthcareEvent[] = []; // Separate storage for healthcare events
  private thresholds = {
    errorRate: 0.05, // 5% error rate threshold
    responseTime: 2000, // 2 second response time threshold
    memoryUsage: 0.8, // 80% memory usage threshold
    diskUsage: 0.9, // 90% disk usage threshold
    failedLogins: 5, // 5 failed login attempts threshold
  };

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  private constructor() {
    this.startPeriodicMonitoring();
  }

  // Record system metrics
  recordMetric = asyncHandler(async (
    metricType: SystemMetric['metricType'],
    value: number,
    unit: string,
    context?: Record<string, any>,
    severity: SystemMetric['severity'] = 'low'
  ): Promise<void> => {
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

      // Store in database for persistence
      await this.persistMetric(metric);

      // Check if metric triggers any alerts
      await this.checkMetricThresholds(metric);

    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  });

  // Create system alerts
  createAlert = asyncHandler(async (
    alertType: Alert['alertType'],
    severity: Alert['severity'],
    message: string,
    details?: Record<string, any>
  ): Promise<string> => {
    const alert: Alert = {
      id: crypto.randomUUID(),
      alertType,
      severity,
      message: sanitizeString(message),
      details,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);
    
    // Keep only last 500 alerts in memory
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    // Store in database
    await this.persistAlert(alert);

    // Send notifications for high/critical alerts
    if (severity === 'high' || severity === 'critical') {
      await this.sendAlertNotification(alert);
    }

    return alert.id;
  });

  // Monitor API response times
  recordAPIResponse = asyncHandler(async (
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string
  ): Promise<void> => {
    const severity = responseTime > this.thresholds.responseTime ? 'medium' : 'low';
    
    await this.recordMetric(
      'performance',
      responseTime,
      'ms',
      {
        endpoint: sanitizeString(endpoint),
        method: sanitizeString(method),
        statusCode,
        userId
      },
      severity
    );

    // Create alert for slow responses
    if (responseTime > this.thresholds.responseTime) {
      await this.createAlert(
        'performance',
        severity,
        `Slow API response detected: ${endpoint}`,
        { responseTime, endpoint, method }
      );
    }
  });

  // Monitor error rates
  recordError = asyncHandler(async (
    errorType: string,
    errorMessage: string,
    context?: Record<string, any>
  ): Promise<void> => {
    await this.recordMetric(
      'error',
      1,
      'count',
      {
        errorType: sanitizeString(errorType),
        errorMessage: sanitizeString(errorMessage),
        ...context
      },
      'medium'
    );

    // Check error rate threshold
    const recentErrors = this.getRecentMetrics('error', 300000); // Last 5 minutes
    const errorRate = recentErrors.length / 300; // errors per second

    if (errorRate > this.thresholds.errorRate) {
      await this.createAlert(
        'system',
        'high',
        `High error rate detected: ${errorRate.toFixed(2)} errors/second`,
        { errorRate, recentErrorCount: recentErrors.length }
      );
    }
  });

  // Monitor user activities
  recordUserActivity = asyncHandler(async (
    userId: string,
    activity: string,
    details?: Record<string, any>
  ): Promise<void> => {
    await this.recordMetric(
      'usage',
      1,
      'count',
      {
        userId: sanitizeString(userId),
        activity: sanitizeString(activity),
        ...details
      },
      'low'
    );
  });

  // Monitor security events
  recordSecurityEvent = asyncHandler(async (
    eventType: string,
    severity: Alert['severity'],
    details: Record<string, any>
  ): Promise<void> => {
    await this.recordMetric(
      'security',
      1,
      'count',
      {
        eventType: sanitizeString(eventType),
        ...details
      },
      severity
    );

    await this.createAlert(
      'security',
      severity,
      `Security event: ${eventType}`,
      details
    );
  });

  // Get system health status
  getSystemHealth = asyncHandler(async (): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    metrics: {
      errorRate: number;
      avgResponseTime: number;
      activeAlerts: number;
      criticalAlerts: number;
    };
  }> => {
    const recentMetrics = this.getRecentMetrics('all', 300000); // Last 5 minutes
    const recentErrors = recentMetrics.filter(m => m.metricType === 'error');
    const recentPerformance = recentMetrics.filter(m => m.metricType === 'performance');
    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

    const errorRate = recentErrors.length / 300;
    const avgResponseTime = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, m) => sum + m.value, 0) / recentPerformance.length
      : 0;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (criticalAlerts.length > 0 || errorRate > this.thresholds.errorRate) {
      status = 'critical';
    } else if (activeAlerts.length > 10 || avgResponseTime > this.thresholds.responseTime) {
      status = 'degraded';
    }

    return {
      status,
      metrics: {
        errorRate,
        avgResponseTime,
        activeAlerts: activeAlerts.length,
        criticalAlerts: criticalAlerts.length
      }
    };
  });

  // Resolve alerts
  resolveAlert = asyncHandler(async (alertId: string): Promise<void> => {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      
      // Update in database
      await this.updateAlertStatus(alertId, true);
    }
  });

  // Enhanced monitoring with UX feedback - Fixed to store UX events separately
  public recordUXEvent = async (
    eventType: 'interaction' | 'navigation' | 'error' | 'accessibility',
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' = 'low'
  ): Promise<void> => {
    try {
      const uxEvent: UXEvent = {
        id: this.generateId(),
        type: 'ux_event',
        timestamp: new Date().toISOString(),
        event_type: eventType,
        data: eventData,
        severity,
        user_agent: navigator.userAgent,
        url: window.location.href
      };

      this.uxEvents.push(uxEvent);
      
      // Keep only last 1000 UX events in memory
      if (this.uxEvents.length > 1000) {
        this.uxEvents = this.uxEvents.slice(-1000);
      }
      
      console.log(`[UX Event] ${eventType}:`, eventData);

      // Trigger immediate flush for high severity events
      if (severity === 'high') {
        await this.flushUXEvents();
      }
    } catch (error) {
      console.error('Failed to record UX event:', error);
    }
  };

  // Healthcare-specific monitoring - Fixed to store healthcare events separately
  public recordHealthcareEvent = async (
    eventType: 'vital_recorded' | 'medication_taken' | 'alert_triggered' | 'appointment_scheduled',
    patientId: string,
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' = 'low'
  ): Promise<void> => {
    try {
      const healthcareEvent: HealthcareEvent = {
        id: this.generateId(),
        type: 'healthcare_event',
        timestamp: new Date().toISOString(),
        event_type: eventType,
        patient_id: patientId,
        data: eventData,
        severity,
        compliance_relevant: ['medication_taken', 'vital_recorded'].includes(eventType)
      };

      this.healthcareEvents.push(healthcareEvent);
      
      // Keep only last 1000 healthcare events in memory
      if (this.healthcareEvents.length > 1000) {
        this.healthcareEvents = this.healthcareEvents.slice(-1000);
      }
      
      console.log(`[Healthcare Event] ${eventType}:`, eventData);

      // Immediate flush for critical healthcare events
      if (severity === 'high' || eventType === 'alert_triggered') {
        await this.flushHealthcareEvents();
      }
    } catch (error) {
      console.error('Failed to record healthcare event:', error);
    }
  };

  // Private helper methods
  private getRecentMetrics(type: SystemMetric['metricType'] | 'all', timeWindow: number): SystemMetric[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.filter(m => {
      const metricTime = new Date(m.timestamp).getTime();
      return metricTime > cutoff && (type === 'all' || m.metricType === type);
    });
  }

  private async persistMetric(metric: SystemMetric): Promise<void> {
    try {
      // In a real implementation, this would save to a metrics database
      console.log('Persisting metric:', metric);
    } catch (error) {
      console.error('Failed to persist metric:', error);
    }
  }

  private async persistAlert(alert: Alert): Promise<void> {
    try {
      // In a real implementation, this would save to an alerts database
      console.log('Persisting alert:', alert);
    } catch (error) {
      console.error('Failed to persist alert:', error);
    }
  }

  private async updateAlertStatus(alertId: string, resolved: boolean): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log('Updating alert status:', alertId, resolved);
    } catch (error) {
      console.error('Failed to update alert status:', error);
    }
  }

  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // In a real implementation, this would send notifications via email/SMS/Slack
      console.log('Sending alert notification:', alert);
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  private async checkMetricThresholds(metric: SystemMetric): Promise<void> {
    // Implementation for checking various metric thresholds
    // This would contain logic for detecting anomalies and triggering alerts
  }

  private startPeriodicMonitoring(): void {
    // Start periodic health checks
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 60000); // Every minute
  }

  private async performHealthCheck(): Promise<void> {
    // Perform basic system health checks
    const health = await this.getSystemHealth();
    
    await this.recordMetric(
      'health',
      health.status === 'healthy' ? 100 : health.status === 'degraded' ? 50 : 0,
      'percent',
      health.metrics,
      health.status === 'critical' ? 'critical' : 'low'
    );
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  // Fixed flush methods to handle the correct event types
  private async flushUXEvents(): Promise<void> {
    const events = this.uxEvents;
    this.uxEvents = [];
    
    // In a real implementation, this would persist UX events to database
    console.log('Flushing UX events:', events);
  }

  private async flushHealthcareEvents(): Promise<void> {
    const events = this.healthcareEvents;
    this.healthcareEvents = [];
    
    // In a real implementation, this would persist healthcare events to database
    console.log('Flushing healthcare events:', events);
  }
}

export default SystemMonitor;
