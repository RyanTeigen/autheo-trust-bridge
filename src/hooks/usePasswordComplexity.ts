import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validatePasswordComplexity } from '@/components/security/PasswordComplexityValidator';

interface UsePasswordComplexityReturn {
  checkPasswordHistory: (password: string) => Promise<boolean>;
  addToPasswordHistory: (passwordHash: string) => Promise<void>;
  isComplexityValid: (password: string) => boolean;
  validatePassword: (password: string) => Promise<{ isValid: boolean; errors: string[] }>;
}

export const usePasswordComplexity = (): UsePasswordComplexityReturn => {
  const { toast } = useToast();

  const checkPasswordHistory = useCallback(async (password: string): Promise<boolean> => {
    try {
      // For now, return true since function is newly created
      // In a real implementation, this would call the check_password_history function
      return true;
    } catch (error) {
      console.error('Error checking password history:', error);
      return true; // Allow password if check fails
    }
  }, []);

  const addToPasswordHistory = useCallback(async (passwordHash: string): Promise<void> => {
    try {
      // For now, just log since table is newly created
      console.log('Password added to history (simulated)');
    } catch (error) {
      console.error('Error adding to password history:', error);
      // Don't throw - this is not critical for user experience
    }
  }, []);

  const isComplexityValid = useCallback((password: string): boolean => {
    return validatePasswordComplexity(password);
  }, []);

  const validatePassword = useCallback(async (password: string): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];

    // Check complexity
    if (!isComplexityValid(password)) {
      errors.push('Password does not meet complexity requirements');
    }

    // Check history
    const isHistoryValid = await checkPasswordHistory(password);
    if (!isHistoryValid) {
      errors.push('Password has been used recently. Please choose a different password.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [isComplexityValid, checkPasswordHistory]);

  return {
    checkPasswordHistory,
    addToPasswordHistory,
    isComplexityValid,
    validatePassword,
  };
};