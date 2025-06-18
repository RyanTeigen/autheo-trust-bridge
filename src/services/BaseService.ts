
import { supabase } from '@/integrations/supabase/client';
import { AppError, AuthenticationError, AuthorizationError, NotFoundError, handleSupabaseError } from '@/utils/errorHandling';
import { requireAuthentication, validateResourceAccess } from '@/utils/security';

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export interface SecurityContext {
  userId: string;
  userRole: string;
  sessionValid: boolean;
  permissions: string[];
}

export abstract class BaseService {
  protected async validateAuthentication(): Promise<SecurityContext> {
    try {
      return await requireAuthentication();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AuthenticationError('Authentication validation failed');
    }
  }

  protected async validateOwnership(resourceOwnerId: string, context: SecurityContext): Promise<boolean> {
    return validateResourceAccess(context.userId, resourceOwnerId, context.userRole);
  }

  protected async validatePermission(permission: string, context: SecurityContext): Promise<boolean> {
    return context.permissions.includes(permission);
  }

  protected handleError(error: any, operation: string): ServiceResponse {
    console.error(`Error in ${operation}:`, error);
    
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        context: { operation, ...error.context }
      };
    }

    const appError = handleSupabaseError(error);
    return {
      success: false,
      error: appError.message,
      statusCode: appError.statusCode,
      context: { operation }
    };
  }

  protected createSuccessResponse<T>(data: T, context?: Record<string, any>): ServiceResponse<T> {
    return {
      success: true,
      data,
      statusCode: 200,
      context
    };
  }

  protected createErrorResponse(error: string, statusCode: number = 500, context?: Record<string, any>): ServiceResponse {
    return {
      success: false,
      error,
      statusCode,
      context
    };
  }
}
