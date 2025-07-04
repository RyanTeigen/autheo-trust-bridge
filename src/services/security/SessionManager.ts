
import { supabase } from '@/integrations/supabase/client';
import { AuthenticationError, logError, AppError } from '@/utils/errorHandling';

export interface SessionConfig {
  maxAge: number; // in minutes
  warningThreshold: number; // in minutes before expiry to warn
  refreshThreshold: number; // in minutes before expiry to auto-refresh
}

export interface SessionInfo {
  userId: string;
  expiresAt: Date;
  lastActivity: Date;
  isValid: boolean;
  timeRemaining: number; // in minutes
}

export class SessionManager {
  private static instance: SessionManager;
  private config: SessionConfig;
  private sessionCheckInterval = 60000; // Check every minute

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private constructor() {
    this.config = {
      maxAge: 480, // 8 hours
      warningThreshold: 15, // Warn 15 minutes before expiry
      refreshThreshold: 30, // Auto-refresh 30 minutes before expiry
    };
    this.startSessionMonitoring();
  }

  public async getCurrentSession(): Promise<SessionInfo | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        const appError = new AuthenticationError('Session validation error', { originalError: error });
        logError(appError);
        return null;
      }
      
      if (!session) {
        return null;
      }

      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)));
      
      return {
        userId: session.user.id,
        expiresAt,
        lastActivity: new Date(localStorage.getItem('lastActivity') || now.toISOString()),
        isValid: timeRemaining > 0,
        timeRemaining
      };
    } catch (error) {
      const appError = error instanceof AppError ? error : new AuthenticationError('Failed to get current session', { originalError: error });
      logError(appError);
      return null;
    }
  }

  public async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        const appError = new AuthenticationError('Session refresh failed', { originalError: error });
        logError(appError);
        return false;
      }
      
      if (data.session) {
        this.updateLastActivity();
        return true;
      }
      
      return false;
    } catch (error) {
      const appError = error instanceof AppError ? error : new AuthenticationError('Session refresh error', { originalError: error });
      logError(appError);
      return false;
    }
  }

  public updateLastActivity(): void {
    const now = new Date().toISOString();
    localStorage.setItem('lastActivity', now);
  }

  public async signOut(reason: 'expired' | 'inactive' | 'manual' = 'manual'): Promise<void> {
    try {
      localStorage.removeItem('lastActivity');
      await supabase.auth.signOut();
      
      // Don't log in production, but provide user feedback through UI
      if (import.meta.env.DEV) {
        console.log(`Session ended: ${reason}`);
      }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AuthenticationError('Sign out error', { originalError: error });
      logError(appError);
    }
  }

  public async isSessionExpiringSoon(): Promise<boolean> {
    const sessionInfo = await this.getCurrentSession();
    return sessionInfo ? sessionInfo.timeRemaining <= this.config.warningThreshold : false;
  }

  private startSessionMonitoring(): void {
    // Check session status every minute
    setInterval(async () => {
      const sessionInfo = await this.getCurrentSession();
      
      if (!sessionInfo || !sessionInfo.isValid) {
        await this.signOut('expired');
        return;
      }
      
      // Check for inactivity
      const timeSinceLastActivity = Date.now() - sessionInfo.lastActivity.getTime();
      const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
      
      if (timeSinceLastActivity > inactivityThreshold) {
        await this.signOut('inactive');
        return;
      }
      
      // Auto-refresh if needed
      if (sessionInfo.timeRemaining <= this.config.refreshThreshold) {
        await this.refreshSession();
      }
    }, this.sessionCheckInterval);
  }

  public getConfig(): SessionConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default SessionManager;
