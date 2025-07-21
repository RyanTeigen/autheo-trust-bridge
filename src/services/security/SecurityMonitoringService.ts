import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/audit/AuditLogger';

interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'unusual_access' | 'data_breach' | 'session_hijack' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  detectedAt: string;
}

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  activeSessions: number;
  suspiciousActivity: number;
  lastThreatDetected?: string;
  complianceScore: number;
}

export class SecurityMonitoringService {
  private static instance: SecurityMonitoringService;
  private threatThresholds = {
    maxFailedLogins: 5,
    maxSessionsPerUser: 3,
    unusualAccessHours: { start: 22, end: 6 }, // 10 PM to 6 AM
    maxRequestsPerMinute: 100,
  };

  private constructor() {}

  public static getInstance(): SecurityMonitoringService {
    if (!SecurityMonitoringService.instance) {
      SecurityMonitoringService.instance = new SecurityMonitoringService();
    }
    return SecurityMonitoringService.instance;
  }

  /**
   * Monitor user login attempts and detect brute force attacks
   */
  async monitorLoginAttempt(email: string, success: boolean, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const timeWindow = 15; // 15 minutes
      const now = new Date();
      const windowStart = new Date(now.getTime() - timeWindow * 60 * 1000);

      // Log the login attempt
      await auditLogger.logEvent({
        action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        resource: 'auth',
        status: success ? 'success' : 'error',
        details: `Login attempt for ${email}`,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      if (!success) {
        // Check for excessive failed logins from same IP or email
        const recentFailures = await this.getRecentFailedLogins(email, ipAddress, windowStart);
        
        if (recentFailures >= this.threatThresholds.maxFailedLogins) {
          await this.reportSecurityThreat({
            type: 'brute_force',
            severity: 'high',
            description: `${recentFailures} failed login attempts detected for ${email}`,
            ipAddress,
            userAgent,
            metadata: {
              email,
              attemptCount: recentFailures,
              timeWindow: `${timeWindow} minutes`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error monitoring login attempt:', error);
    }
  }

  /**
   * Monitor session activity for unusual patterns
   */
  async monitorSessionActivity(userId: string, action: string, ipAddress?: string): Promise<void> {
    try {
      const now = new Date();
      const hour = now.getHours();

      // Detect unusual access hours
      if (hour >= this.threatThresholds.unusualAccessHours.start || 
          hour <= this.threatThresholds.unusualAccessHours.end) {
        await this.reportSecurityThreat({
          type: 'unusual_access',
          severity: 'medium',
          description: `User access detected during off-hours (${hour}:00)`,
          userId,
          ipAddress,
          metadata: {
            action,
            accessTime: now.toISOString(),
            hour,
          },
        });
      }

      // Monitor for multiple concurrent sessions
      const activeSessions = await this.getActiveSessionCount(userId);
      if (activeSessions > this.threatThresholds.maxSessionsPerUser) {
        await this.reportSecurityThreat({
          type: 'session_hijack',
          severity: 'high',
          description: `Multiple concurrent sessions detected for user (${activeSessions} active)`,
          userId,
          ipAddress,
          metadata: {
            sessionCount: activeSessions,
            action,
          },
        });
      }
    } catch (error) {
      console.error('Error monitoring session activity:', error);
    }
  }

  /**
   * Monitor for potential privilege escalation attempts
   */
  async monitorPrivilegeAccess(userId: string, requestedResource: string, userRole: string): Promise<void> {
    try {
      const restrictedResources = ['admin-portal', 'audit-logs', 'security-dashboard'];
      const allowedRoles = {
        'admin-portal': ['admin', 'supervisor'],
        'audit-logs': ['admin', 'compliance', 'provider'],
        'security-dashboard': ['admin', 'compliance', 'provider'],
      };

      if (restrictedResources.includes(requestedResource)) {
        const allowed = allowedRoles[requestedResource as keyof typeof allowedRoles];
        if (!allowed.includes(userRole)) {
          await this.reportSecurityThreat({
            type: 'privilege_escalation',
            severity: 'critical',
            description: `Unauthorized access attempt to ${requestedResource} by ${userRole} role`,
            userId,
            metadata: {
              requestedResource,
              userRole,
              allowedRoles: allowed,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error monitoring privilege access:', error);
    }
  }

  /**
   * Report a security threat
   */
  private async reportSecurityThreat(threat: Omit<SecurityThreat, 'id' | 'detectedAt'>): Promise<void> {
    try {
      const threatEvent = {
        id: crypto.randomUUID(),
        ...threat,
        detectedAt: new Date().toISOString(),
      };

      // Log the security event
      await auditLogger.logEvent({
        action: 'SECURITY_THREAT_DETECTED',
        resource: 'security_monitoring',
        status: 'warning',
        details: threat.description,
      });

      // Store in local storage for demo purposes (in production, use proper alerting)
      this.storeSecurityThreat(threatEvent);

      console.warn('Security threat detected:', threatEvent);
    } catch (error) {
      console.error('Error reporting security threat:', error);
    }
  }

  /**
   * Get recent failed login attempts
   */
  private async getRecentFailedLogins(email: string, ipAddress?: string, since?: Date): Promise<number> {
    try {
      // In a real implementation, this would query the audit_logs table
      // For demo purposes, we'll return a simulated count
      const stored = localStorage.getItem('failed_logins') || '{}';
      const failedLogins = JSON.parse(stored);
      const key = `${email}_${ipAddress || 'unknown'}`;
      return failedLogins[key] || 0;
    } catch (error) {
      console.error('Error getting recent failed logins:', error);
      return 0;
    }
  }

  /**
   * Get active session count for user
   */
  private async getActiveSessionCount(userId: string): Promise<number> {
    try {
      // In a real implementation, this would query the user_sessions table
      // For demo purposes, return a simulated count
      return Math.floor(Math.random() * 4) + 1;
    } catch (error) {
      console.error('Error getting active session count:', error);
      return 1;
    }
  }

  /**
   * Store security threat locally for demo
   */
  private storeSecurityThreat(threat: SecurityThreat): void {
    try {
      const stored = localStorage.getItem('security_threats') || '[]';
      const threats = JSON.parse(stored);
      threats.unshift(threat);
      
      // Keep only the last 50 threats
      const recentThreats = threats.slice(0, 50);
      localStorage.setItem('security_threats', JSON.stringify(recentThreats));
    } catch (error) {
      console.error('Error storing security threat:', error);
    }
  }

  /**
   * Get stored security threats
   */
  getStoredThreats(): SecurityThreat[] {
    try {
      const stored = localStorage.getItem('security_threats') || '[]';
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting stored threats:', error);
      return [];
    }
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const threats = this.getStoredThreats();
      const criticalThreats = threats.filter(t => t.severity === 'critical').length;
      const highThreats = threats.filter(t => t.severity === 'high').length;
      
      // Calculate compliance score (simplified)
      const baseScore = 100;
      const criticalPenalty = criticalThreats * 20;
      const highPenalty = highThreats * 10;
      const complianceScore = Math.max(0, baseScore - criticalPenalty - highPenalty);

      return {
        totalLogins: Math.floor(Math.random() * 1000) + 500,
        failedLogins: Math.floor(Math.random() * 20) + 5,
        activeSessions: Math.floor(Math.random() * 50) + 10,
        suspiciousActivity: threats.length,
        lastThreatDetected: threats[0]?.detectedAt,
        complianceScore,
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        totalLogins: 0,
        failedLogins: 0,
        activeSessions: 0,
        suspiciousActivity: 0,
        complianceScore: 85,
      };
    }
  }

  /**
   * Simulate security threats for demonstration
   */
  simulateSecurityThreats(): void {
    const threats: Array<Omit<SecurityThreat, 'id' | 'detectedAt'>> = [
      {
        type: 'brute_force',
        severity: 'high',
        description: 'Multiple failed login attempts detected from IP 192.168.1.100',
        ipAddress: '192.168.1.100',
        metadata: { attemptCount: 8, timeWindow: '15 minutes' },
      },
      {
        type: 'unusual_access',
        severity: 'medium',
        description: 'User access detected during off-hours (2:30 AM)',
        userId: 'user-123',
        metadata: { accessTime: '2:30 AM', action: 'data_access' },
      },
      {
        type: 'privilege_escalation',
        severity: 'critical',
        description: 'Unauthorized access attempt to admin portal by patient role',
        userId: 'user-456',
        metadata: { requestedResource: 'admin-portal', userRole: 'patient' },
      },
    ];

    threats.forEach(threat => {
      setTimeout(() => this.reportSecurityThreat(threat), Math.random() * 5000);
    });
  }
}

export const securityMonitoring = SecurityMonitoringService.getInstance();
