interface SecurityAlert {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  context?: Record<string, any>;
}

interface NotificationSettings {
  enabled: boolean;
  recipients: string[];
  complianceOfficer?: string;
  severityThreshold: 'critical' | 'high' | 'medium' | 'low';
}

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  private settings: NotificationSettings;

  private constructor() {
    this.settings = {
      enabled: true,
      recipients: ['admin@healthcare.org'], // Default admin email
      severityThreshold: 'high',
    };
    this.loadSettings();
  }

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('email-notification-settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load email notification settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('email-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save email notification settings:', error);
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private shouldSendEmail(severity: SecurityAlert['severity']): boolean {
    if (!this.settings.enabled) return false;

    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const alertLevel = severityLevels.indexOf(severity);
    const thresholdLevel = severityLevels.indexOf(this.settings.severityThreshold);

    return alertLevel >= thresholdLevel;
  }

  async sendSecurityAlert(alert: SecurityAlert): Promise<boolean> {
    if (!this.shouldSendEmail(alert.severity)) {
      console.log(`Email notification skipped for ${alert.severity} severity alert`);
      return false;
    }

    try {
      const response = await fetch('/functions/v1/send-security-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHp6cm9hZmVkYnl0dGRmeXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjAzMzIsImV4cCI6MjA2Mjg5NjMzMn0.N7JqBYswLPuQAUPbyCPjjK9Ij2dRKMzn6l4fxyLIMKA'}`,
        },
        body: JSON.stringify({
          alert,
          recipients: this.settings.recipients,
          complianceOfficer: this.settings.complianceOfficer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Security alert email sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Failed to send security alert email:', error);
      return false;
    }
  }

  async sendComplianceNotification(
    type: 'audit_required' | 'policy_update' | 'training_due' | 'incident_report',
    title: string,
    message: string,
    priority: 'urgent' | 'high' | 'normal' = 'normal'
  ): Promise<boolean> {
    const alert: SecurityAlert = {
      type: `compliance_${type}`,
      severity: priority === 'urgent' ? 'critical' : priority === 'high' ? 'high' : 'medium',
      title,
      description: message,
      timestamp: new Date().toISOString(),
      context: {
        notificationType: type,
        priority,
      },
    };

    return this.sendSecurityAlert(alert);
  }

  async testEmailConfiguration(): Promise<boolean> {
    const testAlert: SecurityAlert = {
      type: 'test_notification',
      severity: 'low',
      title: 'Email Configuration Test',
      description: 'This is a test email to verify your security alert configuration is working correctly.',
      timestamp: new Date().toISOString(),
      context: {
        test: true,
        configuredRecipients: this.settings.recipients.length,
      },
    };

    return this.sendSecurityAlert(testAlert);
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();