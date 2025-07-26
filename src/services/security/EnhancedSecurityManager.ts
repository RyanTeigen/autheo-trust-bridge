/**
 * Enhanced Security Manager
 * Centralized security monitoring, rate limiting, and threat detection
 */

import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

interface RateLimitConfig {
  action: string;
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

class EnhancedSecurityManager {
  private static instance: EnhancedSecurityManager;
  private securityAlerts: SecurityAlert[] = [];
  private monitoringEnabled = true;

  static getInstance(): EnhancedSecurityManager {
    if (!EnhancedSecurityManager.instance) {
      EnhancedSecurityManager.instance = new EnhancedSecurityManager();
    }
    return EnhancedSecurityManager.instance;
  }

  // Log security event
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!this.monitoringEnabled) return;

    try {
      // For now, we'll log to audit_logs table since security_events may not exist
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action: event.event_type,
          resource: 'security_event',
          status: 'success',
          details: event.description,
          metadata: event.metadata || {},
          user_agent: event.user_agent
        });

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback to local logging
        this.logEventLocally(event);
      } else {
        console.log(`Security event logged: ${event.event_type}`);
        
        // Create alert for high/critical events
        if (event.severity === 'high' || event.severity === 'critical') {
          this.createSecurityAlert(event);
        }
      }
    } catch (error) {
      console.error('Error logging security event:', error);
      this.logEventLocally(event);
    }
  }

  // Check rate limiting
  async checkRateLimit(config: RateLimitConfig): Promise<boolean> {
    try {
      // Fallback implementation using local tracking
      const key = `rate_limit_${config.action}`;
      const now = Date.now();
      const windowMs = config.windowMinutes * 60 * 1000;
      
      // Get existing attempts from session storage
      const storedData = sessionStorage.getItem(key);
      let attempts = storedData ? JSON.parse(storedData) : [];
      
      // Filter out attempts outside the time window
      attempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
      
      // Check if we've exceeded the limit
      if (attempts.length >= config.maxAttempts) {
        await this.logSecurityEvent({
          event_type: 'RATE_LIMITED',
          severity: 'medium',
          description: `User rate limited for action: ${config.action}`,
          metadata: { action: config.action, limits: config, attempts: attempts.length }
        });
        return false;
      }
      
      // Record this attempt
      attempts.push(now);
      sessionStorage.setItem(key, JSON.stringify(attempts));
      
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow by default
    }
  }

  // Validate session security
  async validateSessionSecurity(sessionId: string, userAgent?: string, ipAddress?: string): Promise<boolean> {
    try {
      // Fallback implementation using client-side validation
      const sessionKey = `session_security_${sessionId}`;
      const now = Date.now();
      
      // Get stored session data
      const storedData = sessionStorage.getItem(sessionKey);
      let sessionData = storedData ? JSON.parse(storedData) : {
        lastUserAgent: userAgent,
        lastIpAddress: ipAddress,
        riskScore: 0,
        created: now
      };
      
      let riskScore = sessionData.riskScore || 0;
      let securityFlags: string[] = [];
      
      // Check for user agent changes
      if (userAgent && sessionData.lastUserAgent && sessionData.lastUserAgent !== userAgent) {
        riskScore += 15;
        securityFlags.push('user_agent_changed');
      }
      
      // Check for IP address changes (simplified)
      if (ipAddress && sessionData.lastIpAddress && sessionData.lastIpAddress !== ipAddress) {
        riskScore += 20;
        securityFlags.push('ip_changed');
      }
      
      // Update session data
      sessionData.lastUserAgent = userAgent;
      sessionData.lastIpAddress = ipAddress;
      sessionData.riskScore = riskScore;
      sessionData.lastCheck = now;
      sessionData.securityFlags = securityFlags;
      
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
      
      // Log security event if suspicious
      if (riskScore > 30) {
        await this.logSecurityEvent({
          event_type: 'SUSPICIOUS_SESSION',
          severity: riskScore > 50 ? 'high' : 'medium',
          description: 'Session flagged as suspicious due to risk factors',
          metadata: {
            sessionId,
            riskScore,
            flags: securityFlags,
            userAgent,
            ipAddress
          }
        });
      }
      
      // Return false if session is too risky
      return riskScore < 50;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Monitor for suspicious activity
  async monitorSuspiciousActivity(activity: {
    type: string;
    details: Record<string, any>;
    riskScore?: number;
  }): Promise<void> {
    const riskScore = activity.riskScore || this.calculateRiskScore(activity);
    
    if (riskScore > 50) {
      await this.logSecurityEvent({
        event_type: 'SUSPICIOUS_ACTIVITY',
        severity: riskScore > 80 ? 'critical' : 'high',
        description: `Suspicious activity detected: ${activity.type}`,
        metadata: {
          ...activity.details,
          riskScore,
          timestamp: Date.now()
        }
      });
    }
  }

  // Password strength validation
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 20;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 20;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 20;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 20;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 20;
    }

    // Additional complexity checks
    if (password.length >= 12) score += 10;
    if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 10;

    return {
      isValid: feedback.length === 0,
      score: Math.min(score, 100),
      feedback
    };
  }

  // Get security metrics
  async getSecurityMetrics(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    recentEvents: number;
    riskScore: number;
  }> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Try to get from audit_logs table as fallback
      const { data: events, error } = await supabase
        .from('audit_logs')
        .select('action, timestamp')
        .gte('timestamp', oneWeekAgo.toISOString())
        .eq('resource', 'security_event');

      if (error) {
        console.error('Failed to fetch security metrics:', error);
        // Return local metrics as fallback
        const localEvents = JSON.parse(sessionStorage.getItem('security_events') || '[]');
        const recentLocalEvents = localEvents.filter((e: any) => 
          Date.now() - e.timestamp < 24 * 60 * 60 * 1000
        );
        
        return {
          totalEvents: localEvents.length,
          criticalEvents: localEvents.filter((e: any) => e.severity === 'critical').length,
          recentEvents: recentLocalEvents.length,
          riskScore: Math.min(localEvents.length * 5, 100)
        };
      }

      const totalEvents = events?.length || 0;
      const criticalEvents = events?.filter(e => e.action?.includes('CRITICAL')).length || 0;
      const recentEvents = events?.filter(e => 
        new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ).length || 0;

      // Calculate risk score based on events
      const riskScore = Math.min(
        (criticalEvents * 30) + (recentEvents * 10) + (totalEvents * 2),
        100
      );

      return {
        totalEvents,
        criticalEvents,
        recentEvents,
        riskScore
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      return { totalEvents: 0, criticalEvents: 0, recentEvents: 0, riskScore: 0 };
    }
  }

  // Get active security alerts
  getSecurityAlerts(): SecurityAlert[] {
    return this.securityAlerts.filter(alert => !alert.acknowledged);
  }

  // Acknowledge security alert
  acknowledgeAlert(alertId: string): void {
    const alert = this.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  // Clear old alerts
  clearOldAlerts(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.securityAlerts = this.securityAlerts.filter(
      alert => alert.timestamp > oneDayAgo || !alert.acknowledged
    );
  }

  // Enable/disable monitoring
  setMonitoring(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    console.log(`Security monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Private helper methods
  private logEventLocally(event: SecurityEvent): void {
    const logEntry = {
      ...event,
      timestamp: Date.now(),
      source: 'local'
    };
    
    // Store in session storage as fallback
    const localEvents = JSON.parse(sessionStorage.getItem('security_events') || '[]');
    localEvents.push(logEntry);
    
    // Keep only last 100 events
    if (localEvents.length > 100) {
      localEvents.splice(0, localEvents.length - 100);
    }
    
    sessionStorage.setItem('security_events', JSON.stringify(localEvents));
  }

  private createSecurityAlert(event: SecurityEvent): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: event.event_type,
      severity: event.severity,
      message: event.description,
      timestamp: Date.now(),
      acknowledged: false
    };

    this.securityAlerts.push(alert);

    // Cleanup old alerts
    this.clearOldAlerts();
  }

  private calculateRiskScore(activity: { type: string; details: Record<string, any> }): number {
    let score = 0;

    // Base risk scores by activity type
    const riskMap: Record<string, number> = {
      'multiple_failed_logins': 60,
      'unusual_location': 40,
      'suspicious_user_agent': 30,
      'rapid_api_calls': 50,
      'data_export': 70,
      'privilege_escalation': 90
    };

    score += riskMap[activity.type] || 20;

    // Additional risk factors
    if (activity.details.frequency && activity.details.frequency > 10) {
      score += 20;
    }

    if (activity.details.timeOfDay && (activity.details.timeOfDay < 6 || activity.details.timeOfDay > 22)) {
      score += 15;
    }

    return Math.min(score, 100);
  }
}

export const securityManager = EnhancedSecurityManager.getInstance();
