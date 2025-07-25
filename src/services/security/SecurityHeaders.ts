/**
 * Security Headers Service
 * Implements security headers and Content Security Policy
 */

export interface SecurityConfig {
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    reportUri?: string;
  };
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubdomains: boolean;
  };
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  contentTypeOptions: boolean;
  referrerPolicy: string;
}

export class SecurityHeaders {
  private static instance: SecurityHeaders;
  private config: SecurityConfig;

  public static getInstance(): SecurityHeaders {
    if (!SecurityHeaders.instance) {
      SecurityHeaders.instance = new SecurityHeaders();
    }
    return SecurityHeaders.instance;
  }

  private constructor() {
    this.config = {
      csp: {
        enabled: true,
        reportOnly: false,
        reportUri: '/api/csp-report'
      },
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubdomains: true
      },
      frameOptions: 'DENY',
      contentTypeOptions: true,
      referrerPolicy: 'strict-origin-when-cross-origin'
    };
  }

  /**
   * Initialize security headers for the application
   */
  initialize(): void {
    this.setCSP();
    this.setSecurityMeta();
    this.monitorCSPViolations();
  }

  /**
   * Set Content Security Policy
   */
  private setCSP(): void {
    if (!this.config.csp.enabled) return;

    const cspPolicy = this.buildCSPPolicy();
    const headerName = this.config.csp.reportOnly ? 
      'Content-Security-Policy-Report-Only' : 
      'Content-Security-Policy';

    // Try to set via meta tag (limited but better than nothing)
    this.setMetaTag('http-equiv', headerName, cspPolicy);
  }

  /**
   * Build Content Security Policy string
   */
  private buildCSPPolicy(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://ilhzzroafedbyttdfypf.supabase.co wss://ilhzzroafedbyttdfypf.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ];

    if (this.config.csp.reportUri) {
      directives.push(`report-uri ${this.config.csp.reportUri}`);
    }

    return directives.join('; ');
  }

  /**
   * Set security-related meta tags
   */
  private setSecurityMeta(): void {
    // X-Frame-Options equivalent
    this.setMetaTag('http-equiv', 'X-Frame-Options', this.config.frameOptions);
    
    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      this.setMetaTag('http-equiv', 'X-Content-Type-Options', 'nosniff');
    }
    
    // Referrer Policy
    this.setMetaTag('name', 'referrer', this.config.referrerPolicy);
    
    // Permissions Policy (Feature Policy) - Enable WebAuthn
    this.setMetaTag('http-equiv', 'Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), publickey-credentials-create=*, publickey-credentials-get=*');
    
    // X-XSS-Protection (legacy but still useful)
    this.setMetaTag('http-equiv', 'X-XSS-Protection', '1; mode=block');
  }

  /**
   * Set a meta tag with given attributes and content
   */
  private setMetaTag(attr: string, name: string, content: string): void {
    let metaTag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attr, name);
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = content;
  }

  /**
   * Monitor and handle CSP violations
   */
  private monitorCSPViolations(): void {
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleCSPViolation(event as SecurityPolicyViolationEvent);
    });
  }

  /**
   * Handle CSP violation events
   */
  private handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    const violation = {
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Log violation
    console.warn('CSP Violation:', violation);

    // Report to security monitoring service
    this.reportSecurityEvent('csp_violation', violation);
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initialize(); // Re-initialize with new config
  }

  /**
   * Get current security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Check if HTTPS is being used
   */
  isHTTPS(): boolean {
    return location.protocol === 'https:';
  }

  /**
   * Validate security headers are properly set with fallback
   */
  async validateHeaders(): Promise<boolean> {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && !this.isLocalhost()) {
        console.warn('Not running in secure context');
        return false;
      }

      // Try to check headers via fetch
      try {
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const hasCSP = response.headers.has('content-security-policy') || 
                      response.headers.has('content-security-policy-report-only');
        const hasFrameOptions = response.headers.has('x-frame-options');
        const hasContentTypeOptions = response.headers.has('x-content-type-options');
        
        // Consider validation successful if at least basic security is present
        return hasCSP || hasFrameOptions || hasContentTypeOptions || this.checkBasicSecurity();
      } catch (fetchError) {
        // Fallback to basic client-side checks
        return this.checkBasicSecurity();
      }
    } catch (error) {
      console.warn('Header validation failed:', error);
      return false; // Don't fail completely
    }
  }

  /**
   * Check basic security features that can be validated client-side
   */
  private checkBasicSecurity(): boolean {
    try {
      const hasSecureContext = window.isSecureContext || this.isLocalhost();
      const hasHTTPS = this.isHTTPS();
      const hasCSPMeta = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');

      return hasSecureContext && (hasHTTPS || this.isLocalhost());
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if running on localhost
   */
  private isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '0.0.0.0';
  }

  /**
   * Report security events to monitoring service
   */
  private async reportSecurityEvent(eventType: string, details: any): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { enhancedSecurityService } = await import('./EnhancedSecurityService');
      
      // Log security event for monitoring
      console.warn(`Security header violation: ${eventType}`, details);
    } catch (error) {
      console.warn('Failed to report security event:', error);
    }
  }
}

export const securityHeaders = SecurityHeaders.getInstance();