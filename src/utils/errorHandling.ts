
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  CONSENT_ERROR = 'CONSENT_ERROR',
  AUDIT_ERROR = 'AUDIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404, true, context);
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} already exists`, ErrorCode.DUPLICATE_ERROR, 409, true, context);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, any>) {
    super(message, ErrorCode.NETWORK_ERROR, 503, true, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: Record<string, any>) {
    super(message, ErrorCode.DATABASE_ERROR, 500, true, context);
  }
}

// Error handling utilities
export function handleSupabaseError(error: any): AppError {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST116') {
    return new NotFoundError('Record');
  }
  
  if (error?.code === '23505') {
    return new DuplicateError('Record');
  }
  
  if (error?.code === '42501') {
    return new AuthorizationError('Database access denied');
  }
  
  if (error?.message?.includes('JWT')) {
    return new AuthenticationError('Invalid or expired session');
  }
  
  if (error?.message?.includes('RLS')) {
    return new AuthorizationError('Row-level security violation');
  }
  
  return new DatabaseError(error?.message || 'Database operation failed', {
    originalError: error
  });
}

export function handleNetworkError(error: any): NetworkError {
  console.error('Network error:', error);
  
  if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
    return new NetworkError('Network connection failed');
  }
  
  if (error?.code === 'TIMEOUT') {
    return new NetworkError('Request timeout');
  }
  
  return new NetworkError(error?.message || 'Network error occurred', {
    originalError: error
  });
}

export function sanitizeErrorForUser(error: AppError): string {
  // Don't expose sensitive internal details to users
  const userFriendlyMessages: Record<ErrorCode, string> = {
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ErrorCode.AUTHENTICATION_ERROR]: 'Please log in to continue.',
    [ErrorCode.AUTHORIZATION_ERROR]: 'You don\'t have permission to perform this action.',
    [ErrorCode.NOT_FOUND]: 'The requested item could not be found.',
    [ErrorCode.DUPLICATE_ERROR]: 'This item already exists.',
    [ErrorCode.NETWORK_ERROR]: 'Connection error. Please check your internet connection.',
    [ErrorCode.DATABASE_ERROR]: 'A system error occurred. Please try again later.',
    [ErrorCode.EXTERNAL_API_ERROR]: 'External service is temporarily unavailable.',
    [ErrorCode.ENCRYPTION_ERROR]: 'Security operation failed. Please try again.',
    [ErrorCode.CONSENT_ERROR]: 'Consent verification failed.',
    [ErrorCode.AUDIT_ERROR]: 'Audit logging failed.',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
  };
  
  return userFriendlyMessages[error.code] || error.message;
}

export function logError(error: AppError, context?: Record<string, any>): void {
  const logData = {
    timestamp: error.timestamp,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    context: { ...error.context, ...context },
    isOperational: error.isOperational
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logData);
  }
  
  // TODO: In production, send to logging service
  // This could be integrated with services like Sentry, LogRocket, etc.
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        logError(error);
        throw error;
      }
      
      // Convert unknown errors to AppError
      const appError = new AppError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        ErrorCode.UNKNOWN_ERROR,
        500,
        false,
        { originalError: error }
      );
      
      logError(appError);
      throw appError;
    }
  };
}

// Retry logic for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry client errors (4xx)
      if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}
