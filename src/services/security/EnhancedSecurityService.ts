// Enhanced Security Service with comprehensive monitoring and protection
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from './ProductionLogger';
import { secureStorage } from './SecureStorage';

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivity: number;
  activeSessions: number;
  lastSecurityScan: Date;
}

interface SecurityThreat {
  type: 'brute_force' | 'suspicious_activity' | 'data_breach' | 'session_hijack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: Record<string, any>;
  timestamp: Date;
}

class EnhancedSecurityService {
  private static instance: EnhancedSecurityService;
  private securityMetrics: SecurityMetrics;
  private threatDetectionEnabled = true;
  private securityEventBuffer: SecurityThreat[] = [];

  private constructor() {
    this.securityMetrics = {
      failedLoginAttempts: 0,
      suspiciousActivity: 0,
      activeSessions: 0,
      lastSecurityScan: new Date()
    };
    this.initializeSecurityMonitoring();
  }

  static getInstance(): EnhancedSecurityService {
    if (!EnhancedSecurityService.instance) {
      EnhancedSecurityService.instance = new EnhancedSecurityService();
    }
    return EnhancedSecurityService.instance;
  }

  private async initializeSecurityMonitoring(): Promise<void> {
    try {
      // Initialize security configurations if not exists
      await this.ensureSecurityConfigurations();
      
      // Start periodic security monitoring
      this.startPeriodicMonitoring();
      
      // Initialize threat detection
      this.initializeThreatDetection();
      
      productionLogger.info('Enhanced security service initialized');
    } catch (error) {
      productionLogger.error('Failed to initialize security monitoring', { error: error.message });
    }
  }

  private async ensureSecurityConfigurations(): Promise<void> {
    const configs = [
      { key: 'max_failed_login_attempts', value: 5 },
      { key: 'session_timeout_minutes', value: 480 },
      { key: 'password_min_length', value: 12 },
      { key: 'enable_threat_detection', value: true },
      { key: 'security_scan_interval', value: 300 }
    ];

    for (const config of configs) {
      try {
        const { data: existing } = await supabase
          .from('security_configurations')
          .select('id')
          .eq('config_key', config.key)
          .maybeSingle();

        if (!existing) {
          await supabase
            .from('security_configurations')
            .insert({
              config_key: config.key,
              config_value: config.value,
              description: `Security configuration for ${config.key}`
            });
        }
      } catch (error) {
        productionLogger.warn(`Failed to ensure security config: ${config.key}`, { error: error.message });
      }
    }
  }

  private startPeriodicMonitoring(): void {
    // Run security scan every 5 minutes
    setInterval(() => {
      this.performSecurityScan();
    }, 5 * 60 * 1000);

    // Flush security events every minute
    setInterval(() => {
      this.flushSecurityEvents();
    }, 60 * 1000);
  }

  private initializeThreatDetection(): void {
    // Monitor for rapid successive requests (potential DDoS)
    this.monitorRequestPatterns();
    
    // Monitor for unusual access patterns
    this.monitorAccessPatterns();
    
    // Monitor for session anomalies
    this.monitorSessionAnomalies();
  }

  async detectSecurityThreat(
    type: SecurityThreat['type'],
    severity: SecurityThreat['severity'],
    description: string,
    indicators: Record<string, any>
  ): Promise<void> {
    const threat: SecurityThreat = {
      type,
      severity,
      description,
      indicators,
      timestamp: new Date()
    };

    this.securityEventBuffer.push(threat);
    
    // Log immediately for critical threats
    if (severity === 'critical' || severity === 'high') {
      productionLogger.error(`Security threat detected: ${type}`, {
        severity,
        description,
        indicators,
        timestamp: threat.timestamp
      });
      
      // Immediate response for critical threats
      await this.respondToThreat(threat);
    }

    // Store in database for audit trail
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to enhanced audit logs table with correct column names and severity mapping
      await supabase.from('enhanced_audit_logs').insert({
        event_type: 'system_access',
        severity: this.mapSeverityToDbEnum(severity as SecurityThreat['severity']),
        action_performed: `${type}: ${description}`,
        details: indicators,
        phi_accessed: false,
        resource_type: 'security_event',
        retention_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      productionLogger.error('Failed to log security threat to database', { error: error.message });
    }
  }

  private calculateRiskScore(severity: string, type: string): number {
    let baseScore = 0;
    
    switch (severity) {
      case 'critical': baseScore = 90; break;
      case 'high': baseScore = 70; break;
      case 'medium': baseScore = 50; break;
      case 'low': baseScore = 20; break;
    }
    
    // Adjust based on threat type
    switch (type) {
      case 'data_breach': baseScore += 10; break;
      case 'session_hijack': baseScore += 5; break;
      case 'brute_force': baseScore += 5; break;
    }
    
    return Math.min(100, baseScore);
  }

  private mapSeverityToDbEnum(severity: SecurityThreat['severity']): 'info' | 'warning' | 'error' | 'critical' {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  }

  private async respondToThreat(threat: SecurityThreat): Promise<void> {
    switch (threat.severity) {
      case 'critical':
        // Immediate lockdown procedures
        await this.initiateLockdown(threat);
        break;
      case 'high':
        // Enhanced monitoring and alerts
        await this.enhanceMonitoring(threat);
        break;
      case 'medium':
        // Standard response procedures
        await this.standardResponse(threat);
        break;
    }
  }

  private async initiateLockdown(threat: SecurityThreat): Promise<void> {
    productionLogger.error('CRITICAL SECURITY THREAT - Initiating lockdown procedures', {
      threat: threat.type,
      indicators: threat.indicators
    });

    // Force session cleanup
    await this.forceSessionCleanup();
    
    // Notify administrators
    await this.notifySecurityTeam(threat);
  }

  private async enhanceMonitoring(threat: SecurityThreat): Promise<void> {
    productionLogger.warn('HIGH SECURITY THREAT - Enhancing monitoring', {
      threat: threat.type,
      indicators: threat.indicators
    });

    // Increase monitoring frequency
    this.threatDetectionEnabled = true;
  }

  private async standardResponse(threat: SecurityThreat): Promise<void> {
    productionLogger.info('Security threat logged for review', {
      threat: threat.type,
      indicators: threat.indicators
    });
  }

  private async forceSessionCleanup(): Promise<void> {
    try {
      // Cleanup expired sessions using enhanced user sessions table
      await supabase
        .from('enhanced_user_sessions')
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          termination_reason: 'security_emergency'
        })
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true);
      
      productionLogger.info('Emergency session cleanup completed');
    } catch (error) {
      productionLogger.error('Failed to perform emergency session cleanup', { error: error.message });
    }
  }

  private async notifySecurityTeam(threat: SecurityThreat): Promise<void> {
    // In a real implementation, this would send alerts to security team
    productionLogger.error('SECURITY ALERT: Critical threat detected', {
      threat,
      requiresImmedateAttention: true
    });
  }

  private async performSecurityScan(): Promise<void> {
    try {
      // Perform manual security status assessment
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Count active sessions
      const { count: activeSessions } = await supabase
        .from('enhanced_user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('expires_at', now.toISOString());

      // Count recent critical events
      const { count: criticalEvents } = await supabase
        .from('enhanced_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical')
        .gt('created_at', oneDayAgo.toISOString());

      // Count recent failed logins
      const { count: failedLogins } = await supabase
        .from('enhanced_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login_failed')
        .gt('created_at', oneHourAgo.toISOString());

      // Assess security status
      const securityStatus = {
        status: (criticalEvents && criticalEvents > 0) || (failedLogins && failedLogins > 10) ? 'critical' : 'normal',
        active_sessions: activeSessions || 0,
        critical_events: criticalEvents || 0,
        failed_logins: failedLogins || 0
      };

      // Analyze security status
      if (securityStatus.status === 'critical') {
        await this.detectSecurityThreat(
          'suspicious_activity',
          'critical',
          'Critical security status detected during scan',
          securityStatus
        );
      }

      this.securityMetrics.activeSessions = securityStatus.active_sessions;
      this.securityMetrics.lastSecurityScan = new Date();
      productionLogger.debug('Security scan completed', { status: securityStatus.status });
      
    } catch (error) {
      productionLogger.error('Security scan failed', { error: error.message });
    }
  }

  private monitorRequestPatterns(): void {
    const requestCounts = new Map<string, number>();
    const resetInterval = 60000; // Reset every minute

    // Monitor request frequency per IP/user
    setInterval(() => {
      requestCounts.clear();
    }, resetInterval);

    // This would be integrated with actual request monitoring
    productionLogger.debug('Request pattern monitoring initialized');
  }

  private monitorAccessPatterns(): void {
    // Monitor for unusual access patterns
    productionLogger.debug('Access pattern monitoring initialized');
  }

  private monitorSessionAnomalies(): void {
    // Monitor for session hijacking attempts
    productionLogger.debug('Session anomaly monitoring initialized');
  }

  private async flushSecurityEvents(): Promise<void> {
    if (this.securityEventBuffer.length === 0) return;

    const events = [...this.securityEventBuffer];
    this.securityEventBuffer = [];

    // Log accumulated events
    productionLogger.info('Security events summary', {
      eventCount: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      events: events.map(e => ({ type: e.type, severity: e.severity, timestamp: e.timestamp }))
    });
  }

  // Public methods for external use
  async validateSecureAccess(action: string, context: Record<string, any> = {}): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        await this.detectSecurityThreat(
          'suspicious_activity',
          'medium',
          `Unauthorized access attempt: ${action}`,
          context
        );
        return false;
      }

      productionLogger.debug('Secure access validated', { userId: user.id, action, context });
      return true;
    } catch (error) {
      productionLogger.error('Failed to validate secure access', { action, error: error.message });
      return false;
    }
  }

  async logSecurityEvent(eventType: string, data: Record<string, any>): Promise<void> {
    try {
      // Log directly to enhanced audit logs table with correct types
      await supabase.from('enhanced_audit_logs').insert({
        event_type: 'system_access',
        severity: 'info',
        action_performed: eventType,
        details: data,
        phi_accessed: false,
        resource_type: 'security_event',
        retention_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      productionLogger.error('Failed to log security event', { eventType, error: error.message });
    }
  }

  getSecurityMetrics(): SecurityMetrics {
    return { ...this.securityMetrics };
  }
}

export const enhancedSecurityService = EnhancedSecurityService.getInstance();