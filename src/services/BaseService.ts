
import { SecurityMiddleware, validateResourceAccess } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

export abstract class BaseService {
  protected async validateAuthentication() {
    return SecurityMiddleware.getInstance().validateSession();
  }

  protected async validatePermission(permission: string, context: any): Promise<boolean> {
    return context.permissions.includes(permission);
  }

  protected async validateOwnership(resourceId: string, context: any): Promise<boolean> {
    // For patients table, check if the resource belongs to the user
    const { data, error } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', resourceId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return data.user_id === context.userId;
  }

  protected createSuccessResponse<T>(data: T, metadata?: Record<string, any>): ServiceResponse<T> {
    return {
      success: true,
      data,
      metadata
    };
  }

  protected handleError(error: any, operation: string): ServiceResponse<any> {
    console.error(`${operation} error:`, error);
    
    // Handle specific Supabase errors
    if (error.code === 'PGRST116') {
      return {
        success: false,
        data: null,
        error: 'Resource not found',
        statusCode: 404
      };
    }

    if (error.code === '23505') {
      return {
        success: false,
        data: null,
        error: 'Resource already exists',
        statusCode: 409
      };
    }

    return {
      success: false,
      data: null,
      error: error.message || 'An unexpected error occurred',
      statusCode: 500
    };
  }
}
