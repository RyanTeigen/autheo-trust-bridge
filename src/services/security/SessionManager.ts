// HIPAA-compliant session management service
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '../audit/HIPAAAuditLogger';

export interface SessionInfo {
  id: string;
  userId: string;
  sessionToken: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isValid: boolean;
  timeRemaining: number; // in minutes
}

class SessionManager {
  private static instance: SessionManager;
  private sessionToken: string | null = null;
  private lastActivity: Date = new Date();

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
      this.lastActivity = new Date();
      await auditLogger.logLogin(userId, true);

      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  public async getCurrentSession(): Promise<SessionInfo | null> {
    if (!this.sessionToken) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', this.sessionToken)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)));

      return {
        id: data.id,
        userId: data.user_id,
        sessionToken: data.session_token,
        createdAt: data.created_at,
        lastActivity: data.last_activity,
        expiresAt: data.expires_at,
        isValid: expiresAt > now,
        timeRemaining
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  public async refreshSession(): Promise<boolean> {
    if (!this.sessionToken) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('extend_session', { session_token_param: this.sessionToken });

      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }

      this.lastActivity = new Date();
      return data;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  public updateLastActivity(): void {
    this.lastActivity = new Date();
    // You could also update the database here if needed
  }

  public async signOut(reason: string = 'manual'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (this.sessionToken) {
        await supabase
          .from('user_sessions')
          .update({
            is_active: false,
            terminated_at: new Date().toISOString(),
            termination_reason: reason
          })
          .eq('session_token', this.sessionToken);
      }

      await supabase.auth.signOut();

      if (user) {
        await auditLogger.logLogout(user.id);
      }

      this.sessionToken = null;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export as default to match the hook's import
export default SessionManager;

// Also export the instance for convenience
export const sessionManager = SessionManager.getInstance();