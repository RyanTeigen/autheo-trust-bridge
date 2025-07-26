
import { supabase } from '@/integrations/supabase/client';
import { validateUserRole, validatePermissions } from './validation';
import { AuthenticationError, AuthorizationError, ValidationError } from './errorHandling';

export interface SecurityContext {
  userId: string;
  userRole: string;
  sessionValid: boolean;
  permissions: string[];
}

export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  
  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  async validateSession(): Promise<SecurityContext> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new AuthenticationError('Session validation failed');
      }
      
      if (!session || !session.user) {
        throw new AuthenticationError('No valid session found');
      }
      
      // Check if session is expired
      if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
        throw new AuthenticationError('Session has expired');
      }
      
      // Get user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileError) {
        throw new AuthenticationError('Failed to retrieve user profile');
      }
      
      if (!profile) {
        throw new AuthenticationError('User profile not found');
      }
      
      const userRole = validateUserRole(profile.role);
      
      return {
        userId: session.user.id,
        userRole,
        sessionValid: true,
        permissions: this.getRolePermissions(userRole)
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Authentication failed');
    }
  }

  async requireRole(requiredRole: string): Promise<SecurityContext> {
    const context = await this.validateSession();
    
    if (!validatePermissions(context.userRole, requiredRole)) {
      throw new AuthorizationError(
        `Access denied. Required role: ${requiredRole}, user role: ${context.userRole}`
      );
    }
    
    return context;
  }

  async requirePermission(permission: string): Promise<SecurityContext> {
    const context = await this.validateSession();
    
    if (!context.permissions.includes(permission)) {
      throw new AuthorizationError(`Missing required permission: ${permission}`);
    }
    
    return context;
  }

  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      patient: [
        'read:own_data',
        'update:own_profile',
        'create:consent_records',
        'read:own_fitness_data'
      ],
      provider: [
        'read:own_data',
        'update:own_profile',
        'create:consent_records',
        'read:patient_data',
        'create:soap_notes',
        'update:soap_notes',
        'read:audit_logs',
        'create:access_requests'
      ],
      compliance: [
        'read:own_data',
        'update:own_profile',
        'read:all_audit_logs',
        'read:consent_records',
        'create:compliance_reports',
        'read:access_permissions',
        'update:access_permissions'
      ],
      admin: [
        'read:all_data',
        'update:all_data',
        'delete:all_data',
        'create:users',
        'update:users',
        'delete:users',
        'manage:system'
      ]
    };
    
    return permissions[role] || [];
  }

  validateResourceAccess(userId: string, resourceOwnerId: string, userRole: string): boolean {
    // Admin can access everything
    if (userRole === 'admin') {
      return true;
    }
    
    // Users can access their own resources
    if (userId === resourceOwnerId) {
      return true;
    }
    
    // Providers and compliance officers have special access rules
    // This would be expanded based on specific business rules
    return false;
  }

  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .trim()
        .replace(/[<>'"&]/g, '') // Enhanced XSS protection
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/style\s*=/gi, '')
        .replace(/expression\s*\(/gi, '');
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  validateRateLimit(userId: string, action: string, limit: number = 100, window: number = 60000): boolean {
    // Simple in-memory rate limiting (in production, use Redis or similar)
    const key = `${userId}:${action}`;
    const now = Date.now();
    
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }
    
    const userActions = this.rateLimitStore.get(key) || [];
    const recentActions = userActions.filter((timestamp: number) => now - timestamp < window);
    
    if (recentActions.length >= limit) {
      return false;
    }
    
    recentActions.push(now);
    this.rateLimitStore.set(key, recentActions);
    
    return true;
  }

  private rateLimitStore?: Map<string, number[]>;
}

// Utility functions for common security operations
export async function requireAuthentication(): Promise<SecurityContext> {
  return SecurityMiddleware.getInstance().validateSession();
}

export async function requireRole(role: string): Promise<SecurityContext> {
  return SecurityMiddleware.getInstance().requireRole(role);
}

export async function requirePermission(permission: string): Promise<SecurityContext> {
  return SecurityMiddleware.getInstance().requirePermission(permission);
}

export function validateResourceAccess(
  userId: string,
  resourceOwnerId: string,
  userRole: string
): boolean {
  return SecurityMiddleware.getInstance().validateResourceAccess(userId, resourceOwnerId, userRole);
}

export function sanitizeInput(input: any): any {
  return SecurityMiddleware.getInstance().sanitizeInput(input);
}

export function validateRateLimit(
  userId: string,
  action: string,
  limit?: number,
  window?: number
): boolean {
  return SecurityMiddleware.getInstance().validateRateLimit(userId, action, limit, window);
}

// CSRF protection
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}
