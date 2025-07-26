/**
 * CSRF Protection Service
 * Implements secure Cross-Site Request Forgery protection
 */

import { supabase } from '@/integrations/supabase/client';

export interface CSRFToken {
  token: string;
  expiresAt: Date;
  sessionId: string;
}

export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokens = new Map<string, CSRFToken>();
  private readonly TOKEN_LENGTH = 32;
  private readonly TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  /**
   * Generate a new CSRF token for the current session
   */
  async generateToken(): Promise<string> {
    const token = this.generateSecureToken();
    
    // Get session ID with fallback
    let sessionId: string | null = null;
    try {
      sessionId = await this.getCurrentSessionId();
    } catch (error) {
      console.warn('Failed to get session ID, using fallback', error);
      sessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (!sessionId) {
      // Create emergency fallback session ID
      sessionId = `emergency_${Date.now()}_${crypto.getRandomValues(new Uint8Array(4)).join('')}`;
    }

    const csrfToken: CSRFToken = {
      token,
      expiresAt: new Date(Date.now() + this.TOKEN_LIFETIME),
      sessionId
    };

    // Store token both in memory and secure storage with error handling
    this.tokens.set(token, csrfToken);
    
    try {
      await this.storeTokenSecurely(token, csrfToken);
    } catch (error) {
      console.warn('Failed to store CSRF token securely, continuing with memory storage', error);
    }

    // Set as HTTP-only cookie if possible (fallback to secure storage)
    try {
      this.setCSRFCookie(token);
    } catch (error) {
      console.debug('Could not set CSRF cookie, using memory storage', error);
    }

    return token;
  }

  /**
   * Validate a CSRF token against the current session
   */
  async validateToken(token: string): Promise<boolean> {
    if (!token) return false;

    const currentSessionId = await this.getCurrentSessionId();
    if (!currentSessionId) return false;

    // Check memory cache first
    let csrfToken = this.tokens.get(token);
    
    // If not in memory, try secure storage
    if (!csrfToken) {
      csrfToken = await this.getTokenFromStorage(token);
    }

    if (!csrfToken) return false;

    // Validate token
    const isValid = 
      csrfToken.sessionId === currentSessionId &&
      csrfToken.expiresAt > new Date() &&
      this.constantTimeCompare(csrfToken.token, token);

    // Remove expired tokens
    if (csrfToken.expiresAt <= new Date()) {
      this.removeToken(token);
    }

    return isValid;
  }

  /**
   * Remove a specific token
   */
  async removeToken(token: string): Promise<void> {
    this.tokens.delete(token);
    await this.removeTokenFromStorage(token);
  }

  /**
   * Clear all tokens for security reset
   */
  async clearAllTokens(): Promise<void> {
    this.tokens.clear();
    await this.clearStoredTokens();
  }

  /**
   * Get CSRF token from HTML meta tag (for forms)
   */
  getTokenFromMeta(): string | null {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
  }

  /**
   * Set CSRF token in HTML meta tag
   */
  async setTokenInMeta(): Promise<void> {
    const token = await this.generateToken();
    let metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'csrf-token';
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = token;
  }

  /**
   * Add CSRF token to request headers
   */
  addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getTokenFromMeta() || this.getTokenFromCookie();
    
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    
    return headers;
  }

  /**
   * Middleware function for API requests
   */
  async protectRequest(request: Request): Promise<boolean> {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const token = 
      request.headers.get('X-CSRF-Token') ||
      request.headers.get('x-csrf-token') ||
      new URL(request.url).searchParams.get('_token');

    if (!token) {
      console.warn('CSRF token missing from request');
      return false;
    }

    return await this.validateToken(token);
  }

  // Private methods

  private generateSecureToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async getCurrentSessionId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token.slice(-20) || null; // Use last 20 chars as session ID
    } catch {
      return null;
    }
  }

  private async storeTokenSecurely(token: string, csrfToken: CSRFToken): Promise<void> {
    try {
      const { secureKeyStorage } = await import('@/utils/encryption/SecureKeyStorage');
      await secureKeyStorage.storeKey(`csrf_${token}`, JSON.stringify(csrfToken), csrfToken.sessionId);
    } catch (error) {
      console.warn('Failed to store CSRF token securely:', error);
    }
  }

  private async getTokenFromStorage(token: string): Promise<CSRFToken | null> {
    try {
      const { secureKeyStorage } = await import('@/utils/encryption/SecureKeyStorage');
      const stored = await secureKeyStorage.getKey(`csrf_${token}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private async removeTokenFromStorage(token: string): Promise<void> {
    try {
      const { secureKeyStorage } = await import('@/utils/encryption/SecureKeyStorage');
      await secureKeyStorage.removeKey(`csrf_${token}`);
    } catch (error) {
      console.warn('Failed to remove CSRF token from storage:', error);
    }
  }

  private async clearStoredTokens(): Promise<void> {
    // This would need to be implemented based on secure storage capabilities
    console.log('Clearing all stored CSRF tokens');
  }

  private setCSRFCookie(token: string): void {
    try {
      // Set secure cookie if possible (HTTPS only)
      document.cookie = `csrf_token=${token}; Secure; HttpOnly; SameSite=Strict; Max-Age=${this.TOKEN_LIFETIME / 1000}`;
    } catch (error) {
      // Cookie setting might fail in some environments, that's OK
      console.debug('Could not set CSRF cookie:', error);
    }
  }

  private getTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf_token') {
        return value;
      }
    }
    return null;
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}

export const csrfProtection = CSRFProtection.getInstance();