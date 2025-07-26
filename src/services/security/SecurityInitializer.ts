// Centralized security initialization service

import { productionLogger } from './ProductionLogger';
import { xssProtection } from './XSSProtection';
import { secureStorage } from './SecureStorage';
import { roleBasedAccess } from './RoleBasedAccess';
import { SessionManager } from './SessionManager';
import { securityHardening } from './SecurityHardeningService';
import { isProduction } from '@/utils/production';

export class SecurityInitializer {
  private static instance: SecurityInitializer;
  private initialized = false;

  public static getInstance(): SecurityInitializer {
    if (!SecurityInitializer.instance) {
      SecurityInitializer.instance = new SecurityInitializer();
    }
    return SecurityInitializer.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize production logging first (critical for security monitoring)
      if (isProduction()) {
        productionLogger; // Initialize the production logger
      }

      // Initialize XSS protection
      xssProtection.initialize();

      // Initialize session management
      const sessionManager = SessionManager.getInstance();
      await this.initializeSessionSecurity();

      // Migrate insecure localStorage data
      await secureStorage.migrateFromLocalStorage();

      // Initialize RBAC
      roleBasedAccess; // Initialize the RBAC system

      // Initialize general security hardening
      // Note: SecurityHardeningService is already initialized as singleton

      // Add global error handler for security events
      this.initializeGlobalErrorHandler();

      // Initialize CSP reporting
      this.initializeCSPReporting();

      // Set up periodic security checks
      this.setupPeriodicSecurityChecks();

      this.initialized = true;
      
      if (!isProduction()) {
        console.info('🔒 Security services initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize security services:', error);
      throw error;
    }
  }

  private async initializeSessionSecurity(): Promise<void> {
    // Set up secure session configuration
    const sessionManager = SessionManager.getInstance();
    
    sessionManager.updateConfig({
      maxAge: isProduction() ? 480 : 720, // 8 hours prod, 12 hours dev
      warningThreshold: 15,
      refreshThreshold: 30
    });

    // Update last activity on user interactions
    this.setupActivityTracking();
  }

  private setupActivityTracking(): void {
    const sessionManager = SessionManager.getInstance();
    const events = ['click', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      sessionManager.updateLastActivity().catch(() => {
        // Silent fail - don't break user experience
      });
    };

    // Throttle activity updates to once per minute
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) {
        lastUpdate = now;
        updateActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });
  }

  private initializeGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.handleSecurityError('JAVASCRIPT_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleSecurityError('UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  private initializeCSPReporting(): void {
    document.addEventListener('securitypolicyviolation', (event) => {
      // Filter out Supabase realtime WebSocket connections - these are expected and safe
      if (event.violatedDirective === 'connect-src' && 
          event.blockedURI?.includes('supabase.co/realtime/v1/websocket')) {
        // Log but don't treat as security violation
        if (!isProduction()) {
          console.warn('Supabase realtime WebSocket connection blocked by CSP - this is expected behavior');
        }
        return;
      }

      this.handleSecurityError('CSP_VIOLATION', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber
      });
    });
  }

  private async handleSecurityError(type: string, details: any): Promise<void> {
    try {
      // Log to production logger
      productionLogger.error(`Security event: ${type}`, details);

      // Log to audit system
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.rpc('log_sensitive_operation', {
        operation_type: type,
        resource_type: 'security_event',
        additional_details: details
      });
    } catch (error) {
      // Silent fail for logging
      if (!isProduction()) {
        console.warn('Failed to log security error:', error);
      }
    }
  }

  private setupPeriodicSecurityChecks(): void {
    // Run security health checks every 5 minutes
    setInterval(async () => {
      try {
        await this.performSecurityHealthCheck();
      } catch (error) {
        productionLogger.warn('Security health check failed', { error });
      }
    }, 5 * 60 * 1000);
  }

  private async performSecurityHealthCheck(): Promise<void> {
    const checks = [];

    // Check session validity
    const sessionManager = SessionManager.getInstance();
    const sessionInfo = await sessionManager.getCurrentSession();
    
    if (sessionInfo && !sessionInfo.isValid) {
      checks.push('invalid_session');
    }

    // Check for expired sessions
    if (sessionInfo && await sessionManager.isSessionExpiringSoon()) {
      checks.push('session_expiring');
    }

    // Check for security warnings in console (development only)
    if (!isProduction()) {
      // This would be implemented based on your specific monitoring needs
    }

    if (checks.length > 0) {
      productionLogger.warn('Security health check issues detected', { checks });
    }
  }

  // Cleanup method for when the app is being unloaded
  public cleanup(): void {
    if (this.initialized) {
      // Clear sensitive data from memory
      secureStorage.clearAllSecure().catch(() => {
        // Silent fail
      });

      this.initialized = false;
    }
  }
}

// Export singleton instance
export const securityInitializer = SecurityInitializer.getInstance();

// Auto-initialize on import
securityInitializer.initialize().catch((error) => {
  console.error('Failed to auto-initialize security services:', error);
});