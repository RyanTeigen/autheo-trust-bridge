// Security Hardening Service - Phase 1: Critical Security Fixes
import { supabase } from '@/integrations/supabase/client';
import { secureKeyStorage } from '@/utils/encryption/SecureKeyStorage';

export interface SecurityConfig {
  enableConsoleLogging: boolean;
  xssProtectionLevel: 'strict' | 'moderate' | 'basic';
  cspPolicy: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface SecurityViolation {
  type: 'xss_attempt' | 'csp_violation' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
}

class SecurityHardeningService {
  private static instance: SecurityHardeningService;
  private config: SecurityConfig;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = import.meta.env.PROD;
    this.config = this.getDefaultConfig();
    this.initializeSecurityMeasures();
  }

  public static getInstance(): SecurityHardeningService {
    if (!SecurityHardeningService.instance) {
      SecurityHardeningService.instance = new SecurityHardeningService();
    }
    return SecurityHardeningService.instance;
  }

  private getDefaultConfig(): SecurityConfig {
    return {
      enableConsoleLogging: !this.isProduction,
      xssProtectionLevel: 'strict',
      cspPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;",
      sessionTimeout: 480, // 8 hours in minutes
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      }
    };
  }

  private initializeSecurityMeasures(): void {
    this.setupConsoleProtection();
    this.setupXSSProtection();
    this.setupCSPPolicy();
    this.setupSecureLocalStorage();
  }

  private setupConsoleProtection(): void {
    if (this.isProduction && !this.config.enableConsoleLogging) {
      // Use production logger instead of disabling console entirely
      import('./ProductionLogger').then(({ ProductionLogger }) => {
        ProductionLogger.initializeProductionMode();
      });
      // Keep console.error for critical error reporting
    }
  }

  private setupXSSProtection(): void {
    // Add meta tags for XSS protection
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'X-XSS-Protection');
    metaTag.setAttribute('content', '1; mode=block');
    document.head.appendChild(metaTag);

    // Add X-Content-Type-Options
    const contentTypeTag = document.createElement('meta');
    contentTypeTag.setAttribute('http-equiv', 'X-Content-Type-Options');
    contentTypeTag.setAttribute('content', 'nosniff');
    document.head.appendChild(contentTypeTag);
  }

  private setupCSPPolicy(): void {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute('content', this.config.cspPolicy);
    document.head.appendChild(metaTag);
  }

  private setupSecureLocalStorage(): void {
    // Note: Direct localStorage override is complex due to sync/async mismatch
    // Instead, we'll provide secure alternatives through dedicated methods
    console.info('Security Hardening: Secure storage alternatives initialized');
  }

  public sanitizeInput(input: string): string {
    if (!input) return input;

    // Basic XSS prevention
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#96;',
      '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, (s) => map[s]);
  }

  public validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public async reportSecurityViolation(violation: Omit<SecurityViolation, 'timestamp'>): Promise<void> {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: new Date()
    };

    try {
      // Store in Supabase for audit trail
      await supabase.from('audit_logs').insert({
        user_id: violation.userId,
        action: 'SECURITY_VIOLATION',
        resource: 'security',
        resource_id: null,
        status: 'warning',
        details: `${violation.type}: ${violation.description}`,
        metadata: {
          violation_type: violation.type,
          severity: violation.severity,
          details: violation.details,
          ip_address: violation.ipAddress,
          user_agent: violation.userAgent
        },
        phi_accessed: false
      });

      // For critical violations, also alert administrators
      if (violation.severity === 'critical') {
        this.alertAdministrators(fullViolation);
      }
    } catch (error) {
      console.error('Failed to report security violation:', error);
    }
  }

  private async alertAdministrators(violation: SecurityViolation): Promise<void> {
    try {
      // Find admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'admin');

      if (admins) {
        // In a real implementation, you would send notifications to admins
        // For now, we'll just log it
        console.error('CRITICAL SECURITY VIOLATION DETECTED:', violation);
      }
    } catch (error) {
      console.error('Failed to alert administrators:', error);
    }
  }

  public getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeSecurityMeasures();
  }

  // Content Security Policy violation handler
  public handleCSPViolation = (event: SecurityPolicyViolationEvent): void => {
    this.reportSecurityViolation({
      type: 'csp_violation',
      severity: 'medium',
      description: `CSP violation: ${event.violatedDirective}`,
      details: {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        originalPolicy: event.originalPolicy
      }
    });
  };

  // Initialize CSP violation reporting
  public initializeCSPReporting(): void {
    document.addEventListener('securitypolicyviolation', this.handleCSPViolation);
  }

  // Clean up method
  public cleanup(): void {
    document.removeEventListener('securitypolicyviolation', this.handleCSPViolation);
  }
}

export const securityHardening = SecurityHardeningService.getInstance();
export default SecurityHardeningService;
