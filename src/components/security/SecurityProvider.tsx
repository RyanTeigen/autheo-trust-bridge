/**
 * Security Provider Component
 * Wraps the app with security initialization and monitoring
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useSecurityInitialization } from '@/hooks/useSecurityInitialization';
import { SecurityStatusIndicatorEnhanced } from './SecurityStatusIndicatorEnhanced';
import { securityManager } from '@/services/security/EnhancedSecurityManager';

interface SecurityContextType {
  isSecure: boolean;
  isInitializing: boolean;
  securityStatus: any;
  refreshSecurity: () => Promise<void>;
  reportSecurityIssue: (issue: string, details?: any) => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
  showIndicator?: boolean;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  showIndicator = false // Disabled by default
}) => {
  const securityHook = useSecurityInitialization();

  useEffect(() => {
    // Set up global error handlers for security monitoring
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'SecurityError') {
        // Use enhanced security manager
        securityManager.logSecurityEvent({
          event_type: 'JAVASCRIPT_SECURITY_ERROR',
          severity: 'high',
          description: 'JavaScript Security Error occurred',
          metadata: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }
        });

        // Also use legacy reporting for backward compatibility
        securityHook.reportSecurityIssue('JavaScript Security Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'SecurityError') {
        // Use enhanced security manager
        securityManager.logSecurityEvent({
          event_type: 'PROMISE_SECURITY_REJECTION',
          severity: 'medium',
          description: 'Promise Security Rejection occurred',
          metadata: {
            reason: event.reason?.message || 'Unknown rejection',
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }
        });

        // Also use legacy reporting for backward compatibility
        securityHook.reportSecurityIssue('Promise Security Rejection', {
          reason: event.reason?.message
        });
      }
    };

    // Monitor suspicious activity patterns
    const monitorActivity = () => {
      // Check for unusual console access patterns
      if (typeof window.console === 'undefined') {
        securityManager.logSecurityEvent({
          event_type: 'CONSOLE_TAMPERED',
          severity: 'high',
          description: 'Console object has been tampered with or disabled',
          metadata: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          }
        });
      }

      // Check for developer tools
      let devtools = {open: false};
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
          if (!devtools.open) {
            devtools.open = true;
            securityManager.logSecurityEvent({
              event_type: 'DEVTOOLS_DETECTED',
              severity: 'low',
              description: 'Developer tools may be open',
              metadata: {
                outerDimensions: `${window.outerWidth}x${window.outerHeight}`,
                innerDimensions: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: Date.now()
              }
            });
          }
        } else {
          devtools.open = false;
        }
      }, 5000);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Start activity monitoring
    monitorActivity();

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [securityHook]);

  const contextValue: SecurityContextType = {
    isSecure: securityHook.isSecure,
    isInitializing: securityHook.isInitializing,
    securityStatus: securityHook.securityStatus,
    refreshSecurity: securityHook.refreshSecurity,
    reportSecurityIssue: securityHook.reportSecurityIssue
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {showIndicator && securityHook.securityStatus.overallStatus !== 'secure' && (
        <div className="fixed top-4 right-4 z-50">
          <SecurityStatusIndicatorEnhanced compact />
        </div>
      )}
      {children}
    </SecurityContext.Provider>
  );
};