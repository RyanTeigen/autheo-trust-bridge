import { supabase } from '@/integrations/supabase/client';
import { securityConfig } from '@/utils/production';
import AlertManager from '@/services/monitoring/AlertManager';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'data_access' | 'permission_change' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SecurityService {
  private static instance: SecurityService;
  private loginAttempts = new Map<string, number>();
  private rateLimits = new Map<string, RateLimitEntry>();
  private sessionTimeouts = new Map<string, number>();
  private alertManager = AlertManager.getInstance();

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private constructor() {
    this.startSecurityMonitoring();
  }

  // Rate limiting
  isRateLimited(key: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || entry.resetTime < now) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (entry.count >= limit) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        details: { rateLimitExceeded: true, key, attempts: entry.count },
      });
      return true;
    }

    entry.count++;
    return false;
  }

  // Login attempt tracking
  recordLoginAttempt(identifier: string, success: boolean): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;

    if (success) {
      this.loginAttempts.delete(identifier);
      this.logSecurityEvent({
        type: 'login_attempt',
        severity: 'low',
        details: { success: true, identifier, previousAttempts: attempts },
      });
      return true;
    }

    const newAttempts = attempts + 1;
    this.loginAttempts.set(identifier, newAttempts);

    if (newAttempts >= securityConfig.maxLoginAttempts) {
      this.logSecurityEvent({
        type: 'login_attempt',
        severity: 'critical',
        details: { 
          success: false, 
          identifier, 
          attempts: newAttempts,
          accountLocked: true 
        },
      });
      return false;
    }

    this.logSecurityEvent({
      type: 'login_attempt',
      severity: newAttempts > 3 ? 'high' : 'medium',
      details: { success: false, identifier, attempts: newAttempts },
    });

    return true;
  }

  isAccountLocked(identifier: string): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;
    return attempts >= securityConfig.maxLoginAttempts;
  }

  // Session management
  validateSession(sessionToken: string): boolean {
    const timeout = this.sessionTimeouts.get(sessionToken);
    if (!timeout || timeout < Date.now()) {
      this.sessionTimeouts.delete(sessionToken);
      return false;
    }
    return true;
  }

  extendSession(sessionToken: string): void {
    const newTimeout = Date.now() + securityConfig.sessionTimeout;
    this.sessionTimeouts.set(sessionToken, newTimeout);
  }

  terminateSession(sessionToken: string): void {
    this.sessionTimeouts.delete(sessionToken);
    this.logSecurityEvent({
      type: 'login_attempt',
      severity: 'low',
      details: { sessionTerminated: true, sessionToken: sessionToken.substring(0, 8) + '...' },
    });
  }

  // Data access monitoring
  async logDataAccess(
    resourceType: string,
    resourceId: string,
    action: string,
    userId?: string
  ): Promise<void> {
    try {
      // Log to audit table
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        resource: resourceType,
        resource_id: resourceId,
        status: 'success',
        details: `${action} performed on ${resourceType}`,
        metadata: {
          timestamp: new Date().toISOString(),
          resourceType,
          resourceId,
        },
      });

      this.logSecurityEvent({
        type: 'data_access',
        severity: 'low',
        userId,
        details: { resourceType, resourceId, action },
      });
    } catch (error) {
      console.error('Failed to log data access:', error);
    }
  }

  // Input validation and sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < securityConfig.passwordMinLength) {
      errors.push(`Password must be at least ${securityConfig.passwordMinLength} characters long`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  // Permission validation
  async validatePermission(
    userId: string,
    resourceType: string,
    action: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile) return false;

      // Basic role-based access control
      const permissions = this.getRolePermissions(profile.role);
      const hasPermission = permissions.some(p => 
        p.resource === resourceType && p.actions.includes(action)
      );

      if (!hasPermission) {
        this.logSecurityEvent({
          type: 'permission_change',
          severity: 'medium',
          userId,
          details: { 
            unauthorizedAccess: true, 
            resourceType, 
            action, 
            resourceId,
            userRole: profile.role 
          },
        });
      }

      return hasPermission;
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }

  private getRolePermissions(role: string): Array<{ resource: string; actions: string[] }> {
    const permissions = {
      patient: [
        { resource: 'medical_records', actions: ['read'] },
        { resource: 'sharing_permissions', actions: ['create', 'update', 'delete'] },
        { resource: 'patient_notifications', actions: ['read', 'update'] },
      ],
      provider: [
        { resource: 'medical_records', actions: ['create', 'read', 'update'] },
        { resource: 'patients', actions: ['read'] },
        { resource: 'sharing_permissions', actions: ['read'] },
      ],
      admin: [
        { resource: '*', actions: ['*'] },
      ],
      compliance: [
        { resource: 'audit_logs', actions: ['read'] },
        { resource: 'medical_records', actions: ['read'] },
        { resource: 'sharing_permissions', actions: ['read'] },
      ],
    };

    return permissions[role as keyof typeof permissions] || [];
  }

  // Security event logging
  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      ...event,
    };

    // Log to console in development
    console.log('[SECURITY]', securityEvent);

    // Trigger alerts for high-severity events
    if (event.severity === 'critical' || event.severity === 'high') {
      this.alertManager.triggerAlert(
        'security',
        event.severity === 'critical' ? 'critical' : 'high',
        `Security event: ${event.type}`,
        securityEvent.details
      );
    }

    // In production, send to security monitoring service
    this.sendToSecurityService(securityEvent);
  }

  private getClientIP(): string {
    // This would be implemented based on your infrastructure
    // For now, return a placeholder
    return 'unknown';
  }

  private sendToSecurityService(event: SecurityEvent): void {
    // In production, send to your security monitoring service
    console.debug('[SECURITY EVENT]', event);
  }

  private startSecurityMonitoring(): void {
    // Clean up old entries periodically
    setInterval(() => {
      const now = Date.now();
      
      // Clean up rate limits
      for (const [key, entry] of this.rateLimits.entries()) {
        if (entry.resetTime < now) {
          this.rateLimits.delete(key);
        }
      }
      
      // Clean up expired sessions
      for (const [token, timeout] of this.sessionTimeouts.entries()) {
        if (timeout < now) {
          this.sessionTimeouts.delete(token);
        }
      }
      
      // Reset login attempts after 24 hours
      const dayAgo = now - (24 * 60 * 60 * 1000);
      this.loginAttempts.clear(); // Simplified - in production, track timestamps
      
    }, 60000); // Every minute
  }

  // Security health check
  getSecurityStatus(): {
    status: 'secure' | 'warning' | 'critical';
    activeThreats: number;
    lockedAccounts: number;
    activeSessions: number;
    recommendations: string[];
  } {
    const lockedAccounts = Array.from(this.loginAttempts.values())
      .filter(attempts => attempts >= securityConfig.maxLoginAttempts).length;
    
    const activeSessions = this.sessionTimeouts.size;
    const activeThreats = 0; // Would be calculated from security events
    
    const recommendations: string[] = [];
    
    if (lockedAccounts > 0) {
      recommendations.push(`${lockedAccounts} accounts are locked due to failed login attempts`);
    }
    
    if (activeSessions > 100) {
      recommendations.push('High number of active sessions detected');
    }

    const status = activeThreats > 0 ? 'critical' : 
                  (lockedAccounts > 5 || activeSessions > 200) ? 'warning' : 'secure';

    return {
      status,
      activeThreats,
      lockedAccounts,
      activeSessions,
      recommendations,
    };
  }
}

export default SecurityService;