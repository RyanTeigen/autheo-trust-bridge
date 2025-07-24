// Enhanced XSS protection service

export class XSSProtection {
  private static instance: XSSProtection;
  
  public static getInstance(): XSSProtection {
    if (!XSSProtection.instance) {
      XSSProtection.instance = new XSSProtection();
    }
    return XSSProtection.instance;
  }

  // Comprehensive input sanitization
  public sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  private sanitizeString(str: string): string {
    if (!str) return str;
    
    // Basic HTML entity encoding
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remove common XSS vectors
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Remove data URLs that could contain scripts
      .replace(/data:text\/html/gi, '')
      .replace(/data:application\/javascript/gi, '');
  }

  // Validate and sanitize URLs
  public sanitizeUrl(url: string): string {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      
      // Only allow safe protocols
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }
      
      return urlObj.toString();
    } catch {
      // Invalid URL
      return '';
    }
  }

  // Safe HTML content validation (for when innerHTML is necessary)
  public validateSafeHTML(html: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*>/gi,
      /<link\b[^<]*>/gi,
      /<meta\b[^<]*>/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:application\/javascript/gi
    ];

    return !dangerousPatterns.some(pattern => pattern.test(html));
  }

  // Create safe innerHTML replacement
  public createSafeElement(tagName: string, content: string, attributes?: Record<string, string>): HTMLElement {
    const element = document.createElement(tagName);
    
    // Sanitize content
    element.textContent = content;
    
    // Sanitize and set attributes
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        const safeKey = this.sanitizeString(key);
        const safeValue = this.sanitizeString(value);
        
        // Whitelist safe attributes
        const safeAttributes = ['class', 'id', 'title', 'alt', 'role', 'aria-label'];
        if (safeAttributes.includes(safeKey.toLowerCase())) {
          element.setAttribute(safeKey, safeValue);
        }
      }
    }
    
    return element;
  }

  // CSP violation handler
  public handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    const violation = {
      documentURI: event.documentURI,
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      effectiveDirective: event.effectiveDirective,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: new Date().toISOString()
    };

    // Log violation for security monitoring
    this.logSecurityViolation('CSP_VIOLATION', violation);
  }

  private async logSecurityViolation(type: string, details: any): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.rpc('log_sensitive_operation', {
        operation_type: type,
        resource_type: 'security_violation',
        additional_details: details
      });
    } catch (error) {
      // Silent fail for logging
      console.warn('Failed to log security violation:', error);
    }
  }

  // Initialize XSS protection
  public initialize(): void {
    // Add CSP violation listener
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleCSPViolation(event);
    });

    // Override dangerous DOM methods in development
    if (import.meta.env.DEV) {
      this.addDevelopmentWarnings();
    }
  }

  private addDevelopmentWarnings(): void {
    // Warn about dangerous innerHTML usage
    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (originalDescriptor && originalDescriptor.set) {
      const originalSetter = originalDescriptor.set;
      
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value: string) {
          const xss = XSSProtection.getInstance();
          if (!xss.validateSafeHTML(value)) {
            console.warn('⚠️ SECURITY WARNING: Potentially unsafe HTML content detected', {
              element: this.tagName,
              content: value.substring(0, 100) + '...'
            });
          }
          originalSetter.call(this, value);
        },
        get: originalDescriptor.get,
        enumerable: true,
        configurable: true
      });
    }
  }
}

// Export singleton instance
export const xssProtection = XSSProtection.getInstance();