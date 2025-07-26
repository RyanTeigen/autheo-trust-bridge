/**
 * Security Provider Component
 * Wraps the app with security initialization and monitoring
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useSecurityInitialization } from '@/hooks/useSecurityInitialization';
import { SecurityStatusIndicatorEnhanced } from './SecurityStatusIndicatorEnhanced';

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
        securityHook.reportSecurityIssue('Promise Security Rejection', {
          reason: event.reason.message
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

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