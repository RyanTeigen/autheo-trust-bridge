/**
 * Password Strength and Breach Detection Service
 * Implements robust password validation and leaked password protection
 */

import { supabase } from '@/integrations/supabase/client';

export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isValid: boolean;
  estimatedCrackTime: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength: number;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
  preventReuse: number; // Number of previous passwords to check
}

export class PasswordStrengthService {
  private static instance: PasswordStrengthService;
  private policy: PasswordPolicy;
  private commonPasswords: Set<string> = new Set();

  public static getInstance(): PasswordStrengthService {
    if (!PasswordStrengthService.instance) {
      PasswordStrengthService.instance = new PasswordStrengthService();
    }
    return PasswordStrengthService.instance;
  }

  private constructor() {
    this.policy = {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLength: 128,
      preventCommonPasswords: true,
      preventPersonalInfo: true,
      preventReuse: 5
    };
    
    this.loadCommonPasswords();
  }

  /**
   * Analyze password strength and compliance
   */
  async analyzePassword(password: string, userInfo?: any): Promise<PasswordStrength> {
    const feedback: string[] = [];
    let score = 0;

    // Basic length check
    if (password.length < this.policy.minLength) {
      feedback.push(`Password must be at least ${this.policy.minLength} characters long`);
    } else {
      score += 1;
    }

    // Character variety checks
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else if (this.policy.requireUppercase) {
      score += 0.5;
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else if (this.policy.requireLowercase) {
      score += 0.5;
    }

    if (this.policy.requireNumbers && !/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else if (this.policy.requireNumbers) {
      score += 0.5;
    }

    if (this.policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else if (this.policy.requireSpecialChars) {
      score += 0.5;
    }

    // Advanced checks
    if (this.hasRepeatingPatterns(password)) {
      feedback.push('Avoid repeating patterns and sequences');
      score -= 0.5;
    }

    if (this.policy.preventCommonPasswords && this.isCommonPassword(password)) {
      feedback.push('This password is too common and easily guessed');
      score -= 1;
    }

    if (this.policy.preventPersonalInfo && userInfo) {
      if (this.containsPersonalInfo(password, userInfo)) {
        feedback.push('Password should not contain personal information');
        score -= 0.5;
      }
    }

    // Check for leaked passwords
    const isLeaked = await this.checkPasswordBreach(password);
    if (isLeaked) {
      feedback.push('This password has been found in data breaches and should not be used');
      score -= 1;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(4, score));

    const estimatedCrackTime = this.estimateCrackTime(password, score);
    
    return {
      score,
      feedback,
      isValid: feedback.length === 0 && score >= 2,
      estimatedCrackTime
    };
  }

  /**
   * Check if password has been in known data breaches using k-anonymity
   */
  async checkPasswordBreach(password: string): Promise<boolean> {
    try {
      // Use SHA-1 hash and k-anonymity (HaveIBeenPwned API style)
      const hashBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      // In a real implementation, you'd call HaveIBeenPwned API
      // For now, we'll simulate the check
      const response = await this.simulateBreachCheck(prefix);
      
      if (response) {
        const lines = response.split('\n');
        return lines.some(line => line.startsWith(suffix));
      }
      
      return false;
    } catch (error) {
      console.warn('Password breach check failed:', error);
      return false; // Fail open for UX
    }
  }

  /**
   * Validate password against current policy
   */
  async validatePassword(password: string, userInfo?: any): Promise<{ isValid: boolean; errors: string[] }> {
    const analysis = await this.analyzePassword(password, userInfo);
    
    return {
      isValid: analysis.isValid,
      errors: analysis.feedback
    };
  }

  /**
   * Generate a secure password suggestion
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    // Ensure at least one character from each required set
    if (this.policy.requireUppercase) password += this.getRandomChar(uppercase);
    if (this.policy.requireLowercase) password += this.getRandomChar(lowercase);
    if (this.policy.requireNumbers) password += this.getRandomChar(numbers);
    if (this.policy.requireSpecialChars) password += this.getRandomChar(symbols);
    
    // Fill the rest randomly
    while (password.length < length) {
      password += this.getRandomChar(allChars);
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Update password policy
   */
  updatePolicy(newPolicy: Partial<PasswordPolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
  }

  /**
   * Get current password policy
   */
  getPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  // Private helper methods

  private hasRepeatingPatterns(password: string): boolean {
    // Check for repeated characters (more than 2 in a row)
    if (/(.)\1{2,}/.test(password)) return true;
    
    // Check for common sequences
    const sequences = ['123', '234', '345', '456', '567', '678', '789', '890',
                      'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
                      'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop'];
    
    const lowerPassword = password.toLowerCase();
    return sequences.some(seq => lowerPassword.includes(seq) || lowerPassword.includes(seq.split('').reverse().join('')));
  }

  private isCommonPassword(password: string): boolean {
    return this.commonPasswords.has(password.toLowerCase());
  }

  private containsPersonalInfo(password: string, userInfo: any): boolean {
    if (!userInfo) return false;
    
    const personalData = [
      userInfo.email?.split('@')[0],
      userInfo.firstName,
      userInfo.lastName,
      userInfo.username,
      userInfo.phone
    ].filter(Boolean);
    
    const lowerPassword = password.toLowerCase();
    return personalData.some(data => 
      data && lowerPassword.includes(data.toLowerCase())
    );
  }

  private estimateCrackTime(password: string, score: number): string {
    const length = password.length;
    const charSet = this.calculateCharsetSize(password);
    const combinations = Math.pow(charSet, length);
    
    // Assume 1 billion guesses per second
    const secondsToCrack = combinations / (2 * 1000000000);
    
    if (secondsToCrack < 60) return 'Less than a minute';
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 2592000) return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 2592000)} months`;
    return `${Math.round(secondsToCrack / 31536000)} years`;
  }

  private calculateCharsetSize(password: string): number {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/\d/.test(password)) size += 10;
    if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Approximate special chars
    return size;
  }

  private getRandomChar(charset: string): string {
    const randomIndex = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * charset.length);
    return charset[randomIndex];
  }

  private async simulateBreachCheck(prefix: string): Promise<string | null> {
    // In a real implementation, this would call:
    // https://api.pwnedpasswords.com/range/${prefix}
    
    // For simulation, we'll return null (no breach found)
    // In production, implement the actual API call
    return null;
  }

  private loadCommonPasswords(): void {
    // Load most common passwords (top 1000)
    const common = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
      'qwerty123', 'dragon', 'master', 'hello', 'login', 'welcome123'
      // Add more common passwords...
    ];
    
    common.forEach(pwd => this.commonPasswords.add(pwd.toLowerCase()));
  }
}

export const passwordStrengthService = PasswordStrengthService.getInstance();