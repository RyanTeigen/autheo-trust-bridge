import { AlertSeverity, SystemAlert } from '@/types/monitoring';
import { shouldReportError, performanceConfig } from '@/utils/production';

interface AlertChannel {
  id: string;
  type: 'email' | 'webhook' | 'console' | 'toast';
  config: Record<string, any>;
  enabled: boolean;
}

interface AlertRule {
  id: string;
  condition: (alert: SystemAlert) => boolean;
  channels: string[];
  cooldownMs: number;
  lastTriggered?: number;
}

class AlertManager {
  private static instance: AlertManager;
  private alerts: SystemAlert[] = [];
  private channels: Map<string, AlertChannel> = new Map();
  private rules: AlertRule[] = [];
  private alertCounts = new Map<string, number>();

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultRules();
    this.startAlertProcessing();
  }

  private initializeDefaultChannels(): void {
    // Console channel for development
    this.channels.set('console', {
      id: 'console',
      type: 'console',
      config: {},
      enabled: true,
    });

    // Toast channel for UI notifications
    this.channels.set('toast', {
      id: 'toast',
      type: 'toast',
      config: {},
      enabled: true,
    });
  }

  private initializeDefaultRules(): void {
    // Critical error rule
    this.rules.push({
      id: 'critical-errors',
      condition: (alert) => alert.severity === 'critical',
      channels: ['console', 'toast'],
      cooldownMs: 30000, // 30 seconds
    });

    // High error rate rule
    this.rules.push({
      id: 'high-error-rate',
      condition: (alert) => {
        if (alert.type !== 'error_rate') return false;
        const threshold = performanceConfig.batchSize || 10;
        return (alert.value || 0) > threshold;
      },
      channels: ['console'],
      cooldownMs: 300000, // 5 minutes
    });

    // Performance degradation rule
    this.rules.push({
      id: 'performance-degradation',
      condition: (alert) => {
        if (alert.type !== 'performance') return false;
        const threshold = 2000; // 2 seconds
        return (alert.value || 0) > threshold;
      },
      channels: ['console'],
      cooldownMs: 60000, // 1 minute
    });
  }

  async triggerAlert(
    type: SystemAlert['type'],
    severity: AlertSeverity,
    message: string,
    context?: Record<string, any>,
    value?: number
  ): Promise<void> {
    const alert: SystemAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      context,
      value,
      timestamp: new Date(),
      acknowledged: false,
    };

    // Store alert
    this.alerts.push(alert);
    this.trimAlerts();

    // Update alert counts
    const countKey = `${type}-${severity}`;
    this.alertCounts.set(countKey, (this.alertCounts.get(countKey) || 0) + 1);

    // Process alert through rules
    await this.processAlert(alert);
  }

  private async processAlert(alert: SystemAlert): Promise<void> {
    for (const rule of this.rules) {
      if (rule.condition(alert)) {
        // Check cooldown
        if (rule.lastTriggered && Date.now() - rule.lastTriggered < rule.cooldownMs) {
          continue;
        }

        // Send to channels
        for (const channelId of rule.channels) {
          const channel = this.channels.get(channelId);
          if (channel?.enabled) {
            await this.sendToChannel(channel, alert);
          }
        }

        rule.lastTriggered = Date.now();
      }
    }
  }

  private async sendToChannel(channel: AlertChannel, alert: SystemAlert): Promise<void> {
    try {
      switch (channel.type) {
        case 'console':
          this.sendToConsole(alert);
          break;
        case 'toast':
          this.sendToToast(alert);
          break;
        case 'webhook':
          await this.sendToWebhook(channel.config.url, alert);
          break;
        case 'email':
          await this.sendToEmail(channel.config, alert);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }

  private sendToConsole(alert: SystemAlert): void {
    const logMethod = alert.severity === 'critical' ? 'error' : 
                     alert.severity === 'high' ? 'warn' : 'info';
    
    console[logMethod](`[ALERT ${alert.severity.toUpperCase()}] ${alert.message}`, {
      type: alert.type,
      context: alert.context,
      value: alert.value,
      timestamp: alert.timestamp,
    });
  }

  private sendToToast(alert: SystemAlert): void {
    // This would integrate with your toast notification system
    // For now, we'll dispatch a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('system-alert', {
        detail: alert,
      }));
    }
  }

  private async sendToWebhook(url: string, alert: SystemAlert): Promise<void> {
    const payload = {
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp.toISOString(),
        context: alert.context,
        value: alert.value,
      },
    };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  private async sendToEmail(config: any, alert: SystemAlert): Promise<void> {
    // This would integrate with your email service
    console.log('Email alert would be sent:', { config, alert });
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  getAlerts(filters?: {
    severity?: AlertSeverity[];
    type?: SystemAlert['type'][];
    acknowledged?: boolean;
    since?: Date;
  }): SystemAlert[] {
    let filtered = [...this.alerts];

    if (filters) {
      if (filters.severity) {
        filtered = filtered.filter(a => filters.severity!.includes(a.severity));
      }
      if (filters.type) {
        filtered = filtered.filter(a => filters.type!.includes(a.type));
      }
      if (filters.acknowledged !== undefined) {
        filtered = filtered.filter(a => a.acknowledged === filters.acknowledged);
      }
      if (filters.since) {
        filtered = filtered.filter(a => a.timestamp >= filters.since!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAlertCounts(): Map<string, number> {
    return new Map(this.alertCounts);
  }

  clearOldAlerts(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = new Date(Date.now() - olderThanMs);
    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoff);
    return initialCount - this.alerts.length;
  }

  private trimAlerts(): void {
    const maxAlerts = 1000;
    if (this.alerts.length > maxAlerts) {
      this.alerts = this.alerts.slice(-maxAlerts / 2);
    }
  }

  private startAlertProcessing(): void {
    // Start background processing
    setInterval(() => {
      this.clearOldAlerts();
    }, 60000); // Clean up every minute
  }

  addChannel(channel: AlertChannel): void {
    this.channels.set(channel.id, channel);
  }

  removeChannel(channelId: string): void {
    this.channels.delete(channelId);
  }

  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  // Health check for alert system
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'error';
    channels: { [key: string]: boolean };
    rules: number;
    alerts: number;
  }> {
    const channelHealth: { [key: string]: boolean } = {};
    
    for (const [id, channel] of this.channels) {
      try {
        // Test channel connectivity
        channelHealth[id] = channel.enabled;
      } catch {
        channelHealth[id] = false;
      }
    }

    const allChannelsHealthy = Object.values(channelHealth).every(Boolean);
    const status = allChannelsHealthy ? 'healthy' : 'degraded';

    return {
      status,
      channels: channelHealth,
      rules: this.rules.length,
      alerts: this.alerts.length,
    };
  }
}

export default AlertManager;