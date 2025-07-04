// HIPAA-compliant session management service
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '../audit/HIPAAAuditLogger';

export class SessionManager {
  private static instance: SessionManager;
  private sessionToken: string | null = null;

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private constructor() {}

  public async createSession(userId: string): Promise<string> {
    try {
      const sessionToken = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: 'client-detected',
          user_agent: navigator.userAgent
        });

      if (error) {
        throw error;
      }

      this.sessionToken = sessionToken;
      await auditLogger.logLogin(userId, true);

      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export const sessionManager = SessionManager.getInstance();