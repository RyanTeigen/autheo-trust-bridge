// Enhanced Role-Based Access Control service

import { supabase } from '@/integrations/supabase/client';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[];
}

export class RoleBasedAccess {
  private static instance: RoleBasedAccess;
  private roles: Map<string, Role> = new Map();
  
  public static getInstance(): RoleBasedAccess {
    if (!RoleBasedAccess.instance) {
      RoleBasedAccess.instance = new RoleBasedAccess();
    }
    return RoleBasedAccess.instance;
  }

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    // Patient role - can only access their own data
    this.defineRole('patient', {
      name: 'patient',
      permissions: [
        { resource: 'medical_records', action: 'read', conditions: { owner: 'self' } },
        { resource: 'medical_records', action: 'create', conditions: { owner: 'self' } },
        { resource: 'sharing_permissions', action: 'create', conditions: { owner: 'self' } },
        { resource: 'sharing_permissions', action: 'update', conditions: { owner: 'self' } },
        { resource: 'sharing_permissions', action: 'delete', conditions: { owner: 'self' } },
        { resource: 'appointments', action: 'read', conditions: { owner: 'self' } },
        { resource: 'appointments', action: 'create', conditions: { owner: 'self' } },
        { resource: 'profile', action: 'read', conditions: { owner: 'self' } },
        { resource: 'profile', action: 'update', conditions: { owner: 'self', exclude: ['role'] } }
      ]
    });

    // Provider role - can access shared patient data
    this.defineRole('provider', {
      name: 'provider',
      permissions: [
        { resource: 'medical_records', action: 'read', conditions: { shared: true } },
        { resource: 'medical_records', action: 'create', conditions: { target: 'patient' } },
        { resource: 'appointments', action: 'create' },
        { resource: 'appointments', action: 'read', conditions: { provider: 'self' } },
        { resource: 'appointments', action: 'update', conditions: { provider: 'self' } },
        { resource: 'sharing_permissions', action: 'read', conditions: { grantee: 'self' } },
        { resource: 'cross_hospital_requests', action: 'create' },
        { resource: 'cross_hospital_requests', action: 'read', conditions: { provider: 'self' } },
        { resource: 'profile', action: 'read', conditions: { owner: 'self' } },
        { resource: 'profile', action: 'update', conditions: { owner: 'self', exclude: ['role'] } }
      ]
    });

    // Admin role - full access except role changes require additional validation
    this.defineRole('admin', {
      name: 'admin',
      permissions: [
        { resource: '*', action: 'create' },
        { resource: '*', action: 'read' },
        { resource: '*', action: 'update' },
        { resource: '*', action: 'delete' },
        { resource: 'profile', action: 'update', conditions: { roleChanges: 'restricted' } }
      ]
    });

    // Compliance officer role
    this.defineRole('compliance', {
      name: 'compliance',
      permissions: [
        { resource: 'audit_logs', action: 'read' },
        { resource: 'breach_detection_events', action: 'read' },
        { resource: 'breach_detection_events', action: 'update' },
        { resource: 'administrative_safeguards', action: 'create' },
        { resource: 'administrative_safeguards', action: 'read' },
        { resource: 'administrative_safeguards', action: 'update' },
        { resource: 'security_reports', action: 'create' },
        { resource: 'security_reports', action: 'read' }
      ],
      inherits: ['provider']
    });
  }

  public defineRole(roleName: string, role: Role): void {
    this.roles.set(roleName, role);
  }

  public async checkPermission(
    userId: string, 
    resource: string, 
    action: Permission['action'],
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Get user role from database (server-side validation)
      const { data: user, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return false;
      }

      const userRole = this.roles.get(user.role);
      if (!userRole) {
        return false;
      }

      // Check direct permissions
      if (this.hasPermission(userRole, resource, action, userId, context)) {
        return true;
      }

      // Check inherited permissions
      if (userRole.inherits) {
        for (const inheritedRoleName of userRole.inherits) {
          const inheritedRole = this.roles.get(inheritedRoleName);
          if (inheritedRole && this.hasPermission(inheritedRole, resource, action, userId, context)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  private hasPermission(
    role: Role, 
    resource: string, 
    action: Permission['action'],
    userId: string,
    context?: Record<string, any>
  ): boolean {
    for (const permission of role.permissions) {
      // Check if permission matches resource (wildcard or exact match)
      if (permission.resource !== '*' && permission.resource !== resource) {
        continue;
      }

      // Check if action matches
      if (permission.action !== action) {
        continue;
      }

      // Check conditions
      if (permission.conditions) {
        if (!this.evaluateConditions(permission.conditions, userId, context)) {
          continue;
        }
      }

      return true;
    }

    return false;
  }

  private evaluateConditions(
    conditions: Record<string, any>,
    userId: string,
    context?: Record<string, any>
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'owner':
          if (value === 'self' && context?.ownerId !== userId) {
            return false;
          }
          break;
        case 'shared':
          if (value === true && !context?.isShared) {
            return false;
          }
          break;
        case 'provider':
          if (value === 'self' && context?.providerId !== userId) {
            return false;
          }
          break;
        case 'grantee':
          if (value === 'self' && context?.granteeId !== userId) {
            return false;
          }
          break;
        case 'exclude':
          if (Array.isArray(value) && context?.field && value.includes(context.field)) {
            return false;
          }
          break;
        case 'roleChanges':
          if (value === 'restricted' && context?.isRoleChange) {
            // Role changes require additional validation
            return this.validateRoleChange(userId, context);
          }
          break;
        default:
          if (context?.[key] !== value) {
            return false;
          }
      }
    }

    return true;
  }

  private validateRoleChange(userId: string, context?: Record<string, any>): boolean {
    // Only allow role changes if user is admin and not changing their own role
    // or if it's a system operation
    return context?.targetUserId !== userId || context?.isSystemOperation === true;
  }

  // Secure wrapper for checking permissions with additional validation
  public async validateAndAuthorize(
    resource: string,
    action: Permission['action'],
    context?: Record<string, any>
  ): Promise<{ authorized: boolean; userId?: string; reason?: string }> {
    try {
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { authorized: false, reason: 'Not authenticated' };
      }

      // Additional security checks
      if (context?.isRoleChange && context?.targetUserId === user.id) {
        return { authorized: false, reason: 'Cannot modify own role' };
      }

      const authorized = await this.checkPermission(user.id, resource, action, context);
      
      // Log permission check for audit
      await this.logPermissionCheck(user.id, resource, action, authorized, context);

      return { 
        authorized, 
        userId: user.id,
        reason: authorized ? undefined : 'Insufficient permissions'
      };
    } catch (error) {
      console.error('Authorization validation failed:', error);
      return { authorized: false, reason: 'Authorization check failed' };
    }
  }

  private async logPermissionCheck(
    userId: string,
    resource: string,
    action: string,
    authorized: boolean,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.rpc('log_sensitive_operation', {
        operation_type: 'PERMISSION_CHECK',
        resource_type: 'rbac',
        additional_details: {
          resource,
          action,
          authorized,
          context: context || {},
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Silent fail for logging
      console.warn('Failed to log permission check:', error);
    }
  }

  // Get user permissions for UI rendering
  public async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return [];
      }

      const userRole = this.roles.get(user.role);
      if (!userRole) {
        return [];
      }

      let permissions = [...userRole.permissions];

      // Add inherited permissions
      if (userRole.inherits) {
        for (const inheritedRoleName of userRole.inherits) {
          const inheritedRole = this.roles.get(inheritedRoleName);
          if (inheritedRole) {
            permissions = [...permissions, ...inheritedRole.permissions];
          }
        }
      }

      return permissions;
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const roleBasedAccess = RoleBasedAccess.getInstance();