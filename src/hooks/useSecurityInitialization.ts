/**
 * Security Initialization Hook
 * Handles comprehensive security setup on app startup
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { securityHeaders } from '@/services/security/SecurityHeaders';
import { csrfProtection } from '@/services/security/CSRFProtection';
import { passwordStrengthService } from '@/services/security/PasswordStrengthService';
import { securityHardening } from '@/services/security/SecurityHardeningService';
import { useToast } from '@/hooks/use-toast';

export interface SecurityStatus {
  headersInitialized: boolean;
  csrfProtected: boolean;
  keysSecure: boolean;
  hardeningActive: boolean;
  overallStatus: 'initializing' | 'secure' | 'degraded' | 'critical';
}

export const useSecurityInitialization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    headersInitialized: false,
    csrfProtected: false,
    keysSecure: false,
    hardeningActive: false,
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

  const initializeSecurity = async () => {
    try {
      // Initialize security headers and CSP
      securityHeaders.initialize();
      setSecurityStatus(prev => ({ ...prev, headersInitialized: true }));

      // Initialize CSRF protection
      await csrfProtection.setTokenInMeta();
      setSecurityStatus(prev => ({ ...prev, csrfProtected: true }));

      // Initialize security hardening
      await securityHardening.initialize();
      setSecurityStatus(prev => ({ ...prev, hardeningActive: true }));

      // Validate overall security posture
      await validateSecurityPosture();

    } catch (error) {
      console.error('Security initialization failed:', error);
      setSecurityStatus(prev => ({ ...prev, overallStatus: 'critical' }));
      
      toast({
        title: 'Security Warning',
        description: 'Some security features failed to initialize. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const initializeUserSpecificSecurity = async (userId: string) => {
    try {
      // Initialize user-specific encryption keys
      const { migrateFromLocalStorage } = await import('@/utils/encryption/SecureKeyStorage');
      await migrateFromLocalStorage(userId);
      setSecurityStatus(prev => ({ ...prev, keysSecure: true }));

      // Clear any legacy storage
      clearLegacyStorage();

    } catch (error) {
      console.error('User security initialization failed:', error);
      setSecurityStatus(prev => ({ ...prev, overallStatus: 'degraded' }));
    }
  };

  const validateSecurityPosture = async () => {
    try {
      // Check security headers
      const headerValidation = await securityHeaders.validateHeaders();
      
      // Check HTTPS
      if (!securityHeaders.isHTTPS() && window.location.hostname !== 'localhost') {
        console.warn('Application not running over HTTPS in production');
        setSecurityStatus(prev => ({ ...prev, overallStatus: 'degraded' }));
        return;
      }

      // Check overall status
      const allSecure = Object.values(securityStatus).every(status => 
        typeof status === 'boolean' ? status : true
      );

      setSecurityStatus(prev => ({
        ...prev,
        overallStatus: allSecure ? 'secure' : 'degraded'
      }));

    } catch (error) {
      console.error('Security validation failed:', error);
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
    isSecure: securityStatus.overallStatus === 'secure',
    isInitializing: securityStatus.overallStatus === 'initializing'
  };
};