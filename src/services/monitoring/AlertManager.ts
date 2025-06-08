
import { Alert } from './MonitoringTypes';

export class AlertManager {
  private static instance: AlertManager;
  private alerts: Alert[] = [];

  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private constructor() {}

  public async createAlert(
    alertType: Alert['alertType'],
    severity: Alert['severity'],
    message: string,
    details?: Record<string, any>
  ): Promise<string> {
    const alert: Alert = {
      id: crypto.randomUUID(),
      alertType,
      severity,
      message: this.sanitizeString(message),
      details,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);
    
    // Keep only last 500 alerts in memory
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    // Store in database (placeholder)
    await this.persistAlert(alert);

    // Send notifications for high/critical alerts
    if (severity === 'high' || severity === 'critical') {
      await this.sendAlertNotification(alert);
    }

    // Only log in development
    if (import.meta.env.DEV) {
      console.log(`Alert created: ${alertType} - ${severity} - ${message}`);
    }
    
    return alert.id;
  }

  public async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      
      // Update in database (placeholder)
      await this.updateAlertStatus(alertId, true);
      
      // Only log in development
      if (import.meta.env.DEV) {
        console.log(`Alert resolved: ${alertId}`);
      }
    }
  }

  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  public getCriticalAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved && a.severity === 'critical');
  }

  public getAlertsBySeverity(severity: Alert['severity']): Alert[] {
    return this.alerts.filter(a => !a.resolved && a.severity === severity);
  }

  private sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  private async persistAlert(alert: Alert): Promise<void> {
    try {
      // In a real implementation, this would save to a database
      if (import.meta.env.DEV) {
        console.log('Persisting alert:', alert);
      }
    } catch (error) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to persist alert:', error);
      }
    }
  }

  private async updateAlertStatus(alertId: string, resolved: boolean): Promise<void> {
    try {
      // In a real implementation, this would update the database
      if (import.meta.env.DEV) {
        console.log('Updating alert status:', alertId, resolved);
      }
    } catch (error) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to update alert status:', error);
      }
    }
  }

  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // In a real implementation, this would send notifications via email/SMS/Slack
      if (import.meta.env.DEV) {
        console.log('Sending alert notification:', alert);
      }
    } catch (error) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to send alert notification:', error);
      }
    }
  }
}

export default AlertManager;
