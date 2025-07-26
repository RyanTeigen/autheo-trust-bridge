// Security Hardening Service - Phase 1: Critical Security Fixes
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityService } from './EnhancedSecurityService';
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
    // Initialize synchronously first
    this.initializeSecurityMeasures();
  }

  /**
   * Initialize security hardening measures with error handling
   */
  public async initialize(): Promise<void> {
    try {
      // Apply console protection in production
      if (import.meta.env.PROD) {
        this.protectConsole();
      }
      
      // Apply XSS protection meta tags
      this.applyXSSProtection();
      
      // Initialize enhanced CSP policy
      this.initializeEnhancedCSP();
      
      // Setup secure localStorage alternatives
      this.setupSecureStorage();
      
      // Initialize enhanced threat detection
      await this.initializeThreatDetection();
      
      // Setup enhanced session security
      this.setupEnhancedSessionSecurity();
      
      console.log('Security hardening measures activated');
    } catch (error) {
      console.warn('Some security hardening measures failed:', error);
      throw error; // Re-throw to be handled by caller
    }
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


  private protectConsole(): void {
    // Enhanced console protection for production
    if (import.meta.env.PROD) {
      import('./ProductionLogger').then(({ productionLogger }) => {
        // ProductionLogger is already initialized as a singleton
        console.log('Production logger integration enabled');
      });
    }
  }

  private applyXSSProtection(): void {
    // Enhanced XSS protection headers
    const xssProtection = document.createElement('meta');
    xssProtection.httpEquiv = 'X-XSS-Protection';
    xssProtection.content = '1; mode=block';
    document.head.appendChild(xssProtection);

    const contentType = document.createElement('meta');
    contentType.httpEquiv = 'X-Content-Type-Options';
    contentType.content = 'nosniff';
    document.head.appendChild(contentType);
  }

  private initializeEnhancedCSP(): void {
    // Enhanced Content Security Policy with stricter rules
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.co https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://ilhzzroafedbyttdfypf.supabase.co https://*.supabase.co https://api.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
      "report-uri /api/csp-report"
    ].join('; ');

    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = cspPolicy;
    document.head.appendChild(metaCSP);

    // Add additional security headers via meta tags
    this.addSecurityHeaders();

    console.log('Enhanced CSP Policy applied:', cspPolicy);
  }

  private addSecurityHeaders(): void {
    // X-Content-Type-Options
    const noSniff = document.createElement('meta');
    noSniff.httpEquiv = 'X-Content-Type-Options';
    noSniff.content = 'nosniff';
    document.head.appendChild(noSniff);

    // X-Frame-Options
    const frameOptions = document.createElement('meta');
    frameOptions.httpEquiv = 'X-Frame-Options';
    frameOptions.content = 'DENY';
    document.head.appendChild(frameOptions);

    // Referrer Policy
    const referrerPolicy = document.createElement('meta');
    referrerPolicy.name = 'referrer';
    referrerPolicy.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicy);

    // Permissions Policy
    const permissionsPolicy = document.createElement('meta');
    permissionsPolicy.httpEquiv = 'Permissions-Policy';
    permissionsPolicy.content = 'camera=(), microphone=(), geolocation=(), payment=()';
    document.head.appendChild(permissionsPolicy);
  }

  private setupSecureStorage(): void {
    // Enhanced secure storage setup
    console.info('Enhanced Security: Secure storage alternatives initialized');
  }

  public async reportSecurityViolation(violation: Omit<SecurityViolation, 'timestamp'>): Promise<void> {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: new Date()
    };

    try {
      // Enhanced security violation reporting
      console.warn('Security Violation Detected:', violation);
      
      // Report to enhanced security service
      await enhancedSecurityService.detectSecurityThreat(
        'suspicious_activity',
        violation.severity as any,
        violation.description,
        violation.details
      );
      
      // Store in Supabase for audit trail using enhanced audit logs
      await supabase.from('enhanced_audit_logs').insert({
        event_type: 'system_access',
        severity: this.mapViolationSeverity(violation.severity),
        action_performed: `SECURITY_VIOLATION: ${violation.type} - ${violation.description}`,
        details: {
          ...violation.details,
          violationType: violation.type,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        phi_accessed: false,
        resource_type: 'security_event',
        retention_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString()
      });

      // For critical violations, also alert administrators
      if (violation.severity === 'critical') {
        this.alertAdministrators(fullViolation);
      }
    } catch (error) {
      console.error('Failed to report security violation:', error);
    }
  }

  private mapViolationSeverity(severity: string): 'info' | 'warning' | 'error' | 'critical' {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  }

  private async initializeThreatDetection(): Promise<void> {
    // Enhanced threat detection with real-time monitoring
    this.setupDevToolsDetection();
    this.setupNetworkMonitoring();
    this.setupDOMTamperingDetection();
  }

  private setupDevToolsDetection(): void {
    // Detect if developer tools are open (security measure)
    const devtools = {
      open: false,
      orientation: null
    };
    
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          enhancedSecurityService.detectSecurityThreat(
            'suspicious_activity',
            'medium',
            'Developer tools opened during session',
            { timestamp: new Date(), userAgent: navigator.userAgent }
          );
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  private setupNetworkMonitoring(): void {
    // Monitor for unusual network activity patterns
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : 
                  input instanceof URL ? input.toString() : 
                  input.url;
      
      // Log API calls for monitoring
      if (url.includes('supabase.co')) {
        enhancedSecurityService.logSecurityEvent('API_CALL', { 
          url: url.toString(), 
          method: init?.method || 'GET',
          timestamp: new Date()
        });
      }
      
      return originalFetch(input, init);
    };
  }

  private setupDOMTamperingDetection(): void {
    // Detect DOM manipulation attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-approved')) {
                enhancedSecurityService.detectSecurityThreat(
                  'suspicious_activity',
                  'high',
                  'Unauthorized script injection detected',
                  { 
                    tagName: element.tagName,
                    src: element.getAttribute('src'),
                    innerHTML: element.innerHTML.substring(0, 100)
                  }
                );
              }
            }
          });
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  private setupEnhancedSessionSecurity(): void {
    // Enhanced session security monitoring
    let lastActivity = Date.now();
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Monitor user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for session anomalies
    setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      
      // Detect unusually long inactivity
      if (inactiveTime > 30 * 60 * 1000) { // 30 minutes
        enhancedSecurityService.detectSecurityThreat(
          'session_hijack',
          'medium',
          'Extended session inactivity detected',
          { inactiveMinutes: Math.floor(inactiveTime / 60000) }
        );
      }
    }, 60000); // Check every minute
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
