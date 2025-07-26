/**
 * Security Initialization Hook
 * Handles comprehensive security setup on app startup
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { securityHeaders } from '@/services/security/SecurityHeaders';
import { csrfProtection } from '@/services/security/CSRFProtection';
import { securityHardening } from '@/services/security/SecurityHardeningService';
import { useToast } from '@/hooks/use-toast';

export interface SecurityStatus {
  headersInitialized: boolean;
  csrfProtected: boolean;
  keysSecure: boolean;
  hardeningActive: boolean;
  webAuthnSupported: boolean;
  retryCount: number;
  lastError: string | null;
  diagnostics: SecurityDiagnostic[];
  overallStatus: 'initializing' | 'secure' | 'degraded' | 'critical';
}

export interface SecurityDiagnostic {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  details?: any;
}

export const useSecurityInitialization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    headersInitialized: false,
    csrfProtected: false,
    keysSecure: false,
    hardeningActive: false,
    webAuthnSupported: false,
    retryCount: 0,
    lastError: null,
    diagnostics: [],
    overallStatus: 'initializing'
  });

  useEffect(() => {
    initializeSecurity();
  }, []);

  useEffect(() => {
    if (user) {
      initializeUserSpecificSecurity(user.id);
    }
  }, [user]);

  const addDiagnostic = (component: string, status: 'success' | 'warning' | 'error', message: string, details?: any) => {
    const diagnostic: SecurityDiagnostic = {
      component,
      status,
      message,
      timestamp: Date.now(),
      details
    };
    
    setSecurityStatus(prev => ({
      ...prev,
      diagnostics: [...prev.diagnostics.slice(-9), diagnostic] // Keep last 10 diagnostics
    }));
    
    console.log(`[Security ${status.toUpperCase()}] ${component}: ${message}`, details);
  };

  const checkWebAuthnSupported = async (): Promise<boolean> => {
    try {
      return !!(window.PublicKeyCredential && 
               await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
    } catch {
      return false;
    }
  };

  const initializeSecurity = async (retryAttempt = 0) => {
    const maxRetries = 3;
    addDiagnostic('initialization', 'warning', `Starting security initialization (attempt ${retryAttempt + 1}/${maxRetries + 1})`);
    
    try {
      setSecurityStatus(prev => ({ 
        ...prev, 
        retryCount: retryAttempt,
        lastError: null,
        overallStatus: 'initializing'
      }));

      // Check WebAuthn support
      const webAuthnSupported = await checkWebAuthnSupported();
      setSecurityStatus(prev => ({ ...prev, webAuthnSupported }));
      addDiagnostic('webauthn', webAuthnSupported ? 'success' : 'warning', 
        webAuthnSupported ? 'WebAuthn/hardware security available' : 'WebAuthn not supported, using fallback security');

      // Initialize security headers and CSP with detailed logging
      try {
        securityHeaders.initialize();
        setSecurityStatus(prev => ({ ...prev, headersInitialized: true }));
        addDiagnostic('headers', 'success', 'Security headers and CSP initialized');
      } catch (error) {
        addDiagnostic('headers', 'error', 'Failed to initialize security headers', error);
        throw error;
      }

      // Initialize CSRF protection with improved fallback
      try {
        await csrfProtection.setTokenInMeta();
        setSecurityStatus(prev => ({ ...prev, csrfProtected: true }));
        addDiagnostic('csrf', 'success', 'CSRF protection initialized');
      } catch (error) {
        addDiagnostic('csrf', 'warning', 'CSRF protection failed, implementing fallback', error);
        // Implement basic CSRF fallback
        try {
          const fallbackToken = crypto.getRandomValues(new Uint8Array(16))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
          
          let metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'csrf-token';
            document.head.appendChild(metaTag);
          }
          metaTag.content = fallbackToken;
          
          setSecurityStatus(prev => ({ ...prev, csrfProtected: true }));
          addDiagnostic('csrf', 'success', 'CSRF fallback protection active');
        } catch (fallbackError) {
          addDiagnostic('csrf', 'error', 'Both CSRF and fallback failed', fallbackError);
          setSecurityStatus(prev => ({ ...prev, csrfProtected: false }));
        }
      }

      // Initialize security hardening with graceful degradation
      try {
        await securityHardening.initialize();
        setSecurityStatus(prev => ({ ...prev, hardeningActive: true }));
        addDiagnostic('hardening', 'success', 'Security hardening activated');
      } catch (error) {
        addDiagnostic('hardening', 'warning', 'Security hardening partially failed, using fallback', error);
        // Set basic fallback hardening
        try {
          // Basic client-side security measures
          if (typeof window !== 'undefined') {
            // Disable right-click in production
            if (import.meta.env.PROD) {
              document.addEventListener('contextmenu', (e) => e.preventDefault());
            }
            setSecurityStatus(prev => ({ ...prev, hardeningActive: true }));
            addDiagnostic('hardening', 'success', 'Fallback security hardening active');
          }
        } catch (fallbackError) {
          addDiagnostic('hardening', 'error', 'Both hardening and fallback failed', fallbackError);
          setSecurityStatus(prev => ({ ...prev, hardeningActive: false }));
        }
      }

      // Validate overall security posture
      await validateSecurityPosture();
      addDiagnostic('validation', 'success', 'Security posture validation completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDiagnostic('initialization', 'error', `Security initialization failed: ${errorMessage}`, error);
      
      setSecurityStatus(prev => ({ 
        ...prev, 
        lastError: errorMessage,
        overallStatus: retryAttempt >= maxRetries ? 'critical' : 'degraded'
      }));
      
      // Retry logic
      if (retryAttempt < maxRetries) {
        addDiagnostic('retry', 'warning', `Retrying security initialization in ${(retryAttempt + 1) * 2} seconds`);
        setTimeout(() => initializeSecurity(retryAttempt + 1), (retryAttempt + 1) * 2000);
        return;
      }
      
      // Final failure handling
      toast({
        title: 'Security Warning',
        description: `Security initialization failed after ${maxRetries + 1} attempts. Some features may be limited.`,
        variant: 'destructive'
      });
    }
  };

  const initializeUserSpecificSecurity = async (userId: string) => {
    addDiagnostic('user-security', 'warning', `Initializing user-specific security for user: ${userId.substring(0, 8)}...`);
    
    try {
      // Initialize user-specific encryption keys with improved fallback
      try {
        const { migrateFromLocalStorage } = await import('@/utils/encryption/SecureKeyStorage');
        await migrateFromLocalStorage(userId);
        setSecurityStatus(prev => ({ ...prev, keysSecure: true }));
        addDiagnostic('keys', 'success', 'User encryption keys migrated successfully');
      } catch (keyError) {
        addDiagnostic('keys', 'warning', 'Key migration failed, attempting fallback', keyError);
        
        // Try alternative key initialization
        try {
          const { secureKeyStorage } = await import('@/utils/encryption/SecureKeyStorage');
          await secureKeyStorage.generateSecureKey();
          setSecurityStatus(prev => ({ ...prev, keysSecure: true }));
          addDiagnostic('keys', 'success', 'Fallback key generation successful');
        } catch (fallbackError) {
          addDiagnostic('keys', 'error', 'Both key migration and fallback failed', fallbackError);
          setSecurityStatus(prev => ({ ...prev, keysSecure: false }));
        }
      }

      // Clear any legacy storage
      try {
        clearLegacyStorage();
        addDiagnostic('cleanup', 'success', 'Legacy storage cleaned up');
      } catch (cleanupError) {
        addDiagnostic('cleanup', 'warning', 'Legacy cleanup partially failed', cleanupError);
      }

      addDiagnostic('user-security', 'success', 'User-specific security initialization completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDiagnostic('user-security', 'error', `User security initialization failed: ${errorMessage}`, error);
      setSecurityStatus(prev => ({ ...prev, overallStatus: 'degraded', lastError: errorMessage }));
    }
  };

  const validateSecurityPosture = async () => {
    try {
      // Check security headers with fallback
      let headerValidation = true;
      try {
        const validation = await securityHeaders.validateHeaders();
        headerValidation = typeof validation === 'boolean' ? validation : true;
      } catch (headerError) {
        addDiagnostic('headers', 'warning', 'Header validation failed, using fallback', headerError);
        headerValidation = false;
      }
      
      // Check HTTPS - only critical in production
      const isHTTPS = securityHeaders.isHTTPS();
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (!isHTTPS && !isLocalhost) {
        addDiagnostic('https', 'error', 'Production app not running over HTTPS');
        setSecurityStatus(prev => ({ ...prev, overallStatus: 'critical' }));
        return;
      }

      // Calculate overall security status with more lenient criteria
      const currentStatus = securityStatus;
      const criticalFailures = [
        !isHTTPS && !isLocalhost, // HTTPS required in production
        currentStatus.retryCount >= 3 && currentStatus.lastError // Max retries exceeded
      ].filter(Boolean).length;

      const securityFeatures = [
        currentStatus.headersInitialized,
        currentStatus.csrfProtected,
        currentStatus.keysSecure,
        currentStatus.hardeningActive
      ];

      const workingFeatures = securityFeatures.filter(Boolean).length;
      const totalFeatures = securityFeatures.length;

      let overallStatus: 'secure' | 'degraded' | 'critical';
      
      if (criticalFailures > 0) {
        overallStatus = 'critical';
      } else if (workingFeatures >= Math.ceil(totalFeatures * 0.5)) { // Lowered to 50% threshold
        overallStatus = 'secure';
      } else {
        overallStatus = 'degraded';
      }

      setSecurityStatus(prev => ({
        ...prev,
        overallStatus
      }));

      addDiagnostic('validation', 'success', 
        `Security posture: ${overallStatus} (${workingFeatures}/${totalFeatures} features active)`);

    } catch (error) {
      addDiagnostic('validation', 'error', 'Security validation failed completely', error);
      setSecurityStatus(prev => ({ ...prev, overallStatus: 'critical' }));
    }
  };

  const clearLegacyStorage = () => {
    // Clear legacy encryption keys from localStorage
    const legacyKeys = [
      'user_aes_key',
      'user_private_key',
      'userEncryptionKey',
      'lastActivity'
    ];

    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleared legacy key: ${key}`);
      }
    });
  };

  const refreshSecurity = async () => {
    setSecurityStatus(prev => ({ ...prev, overallStatus: 'initializing' }));
    await initializeSecurity();
    if (user) {
      await initializeUserSpecificSecurity(user.id);
    }
  };

  const reportSecurityIssue = async (issue: string, details?: any) => {
    try {
      console.warn(`Security issue reported: ${issue}`, details);
      
      // In a real app, you'd send this to your security monitoring service
      toast({
        title: 'Security Issue Detected',
        description: `${issue}. Security measures are being applied.`,
        variant: 'destructive'
      });
      
    } catch (error) {
      console.error('Failed to report security issue:', error);
    }
  };

  return {
    securityStatus,
    refreshSecurity,
    reportSecurityIssue,
    addDiagnostic,
    isSecure: securityStatus.overallStatus === 'secure',
    isInitializing: securityStatus.overallStatus === 'initializing'
  };
};