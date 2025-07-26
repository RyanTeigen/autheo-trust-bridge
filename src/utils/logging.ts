// Production-safe logging utilities for client-side code
import { productionLogger } from '@/services/security/ProductionLogger';
import { isDevelopment, isProduction } from './production';

/**
 * Client-side production-safe logging utilities
 * Replaces all console.log usage throughout the application
 */
export class AppLogger {
  private static instance: AppLogger;
  
  public static getInstance(): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger();
    }
    return AppLogger.instance;
  }

  // Debug logging - only in development
  public debug(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.debug(`[DEBUG] ${message}`, context);
    }
    // Debug logs are not persisted in production
  }

  // Info logging - development console + production audit
  public info(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.info(`[INFO] ${message}`, context);
    }
    productionLogger.info(message, context);
  }

  // Warning logging - always logged
  public warn(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.warn(`[WARN] ${message}`, context);
    }
    productionLogger.warn(message, context);
  }

  // Error logging - always logged and tracked
  public error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error ? {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      } : { error: String(error) })
    };

    if (isDevelopment()) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    productionLogger.error(message, errorContext);
  }

  // Performance logging - development only unless specified
  public performance(operation: string, duration: number, context?: Record<string, any>): void {
    const logMessage = `${operation} completed in ${duration.toFixed(2)}ms`;
    
    if (isDevelopment()) {
      console.log(`[PERFORMANCE] ${logMessage}`, context);
    }
    
    // Log performance issues in production (>2s operations)
    if (isProduction() && duration > 2000) {
      productionLogger.warn(`Slow operation detected: ${logMessage}`, {
        ...context,
        performanceIssue: true,
        duration
      });
    }
  }

  // Security event logging - always tracked
  public security(event: string, context?: Record<string, any>): void {
    const message = `Security event: ${event}`;
    
    if (isDevelopment()) {
      console.warn(`[SECURITY] ${message}`, context);
    }
    
    productionLogger.warn(message, {
      ...context,
      securityEvent: true,
      timestamp: new Date().toISOString()
    });
  }

  // User action logging - for analytics and audit
  public userAction(action: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.log(`[USER_ACTION] ${action}`, context);
    }
    
    productionLogger.info(`User action: ${action}`, {
      ...context,
      userAction: true
    });
  }

  // API call logging
  public apiCall(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void {
    const message = `${method} ${url} - ${status} (${duration}ms)`;
    
    if (isDevelopment()) {
      console.log(`[API] ${message}`, context);
    }
    
    // Log failed API calls in production
    if (status >= 400) {
      productionLogger.warn(`API call failed: ${message}`, {
        ...context,
        apiCall: true,
        method,
        url,
        status,
        duration
      });
    }
  }

  // Component lifecycle logging - development only
  public component(componentName: string, lifecycle: 'mount' | 'unmount' | 'render' | 'error', context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.log(`[COMPONENT] ${componentName} - ${lifecycle}`, context);
    }
    // Component lifecycle is not logged in production unless it's an error
    if (lifecycle === 'error') {
      productionLogger.error(`Component error in ${componentName}`, context);
    }
  }
}

// Create singleton instance
export const logger = AppLogger.getInstance();

// Convenience functions for backward compatibility and ease of use
export const debugLog = (message: string, context?: Record<string, any>) => logger.debug(message, context);
export const infoLog = (message: string, context?: Record<string, any>) => logger.info(message, context);
export const warnLog = (message: string, context?: Record<string, any>) => logger.warn(message, context);
export const errorLog = (message: string, error?: Error | unknown, context?: Record<string, any>) => logger.error(message, error, context);
export const performanceLog = (operation: string, duration: number, context?: Record<string, any>) => logger.performance(operation, duration, context);
export const securityLog = (event: string, context?: Record<string, any>) => logger.security(event, context);
export const userActionLog = (action: string, context?: Record<string, any>) => logger.userAction(action, context);
export const apiLog = (method: string, url: string, status: number, duration: number, context?: Record<string, any>) => logger.apiCall(method, url, status, duration, context);
export const componentLog = (componentName: string, lifecycle: 'mount' | 'unmount' | 'render' | 'error', context?: Record<string, any>) => logger.component(componentName, lifecycle, context);

// Development mode console protection
if (isProduction()) {
  // Override console methods in production to prevent accidental logging
  const originalConsole = { ...console };
  
  Object.assign(console, {
    log: (...args: any[]) => {
      // Redirect to info logging
      logger.info('Console.log called in production', { args: args.map(String) });
    },
    debug: (...args: any[]) => {
      // Suppress debug in production
    },
    info: (...args: any[]) => {
      logger.info('Console.info called', { args: args.map(String) });
    },
    warn: (...args: any[]) => {
      logger.warn('Console.warn called', { args: args.map(String) });
    },
    error: (...args: any[]) => {
      logger.error('Console.error called', args[0], { additionalArgs: args.slice(1).map(String) });
    }
  });

  // Preserve original console for internal use if needed
  (window as any).__originalConsole = originalConsole;
}