// Production-safe logging service that replaces console.log usage

import { isProduction, isDevelopment } from '@/utils/production';

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private flushInterval = 30000; // 30 seconds

  public static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private constructor() {
    if (isProduction()) {
      // In production, periodically flush logs to audit system
      setInterval(() => this.flushLogs(), this.flushInterval);
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.debug(`[DEBUG] ${message}`, context);
    }
    // Don't store debug logs in production
  }

  public info(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.info(`[INFO] ${message}`, context);
    } else {
      this.addToBuffer('info', message, context);
    }
  }

  public warn(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      this.addToBuffer('warn', message, context);
    }
  }

  public error(message: string, context?: Record<string, any>): void {
    if (isDevelopment()) {
      console.error(`[ERROR] ${message}`, context);
    } else {
      this.addToBuffer('error', message, context);
      // Immediately flush critical errors
      this.flushLogs();
    }
  }

  private addToBuffer(level: LogEntry['level'], message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };

    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    // Remove sensitive data from logs
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'privateKey', 'encryptedData'];
    
    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getCurrentUserId(): string | undefined {
    try {
      // This is a simplified way to get user ID - in practice you'd use your auth system
      return undefined; // Will be populated by actual auth context
    } catch {
      return undefined;
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Send logs to audit system
      const { supabase } = await import('@/integrations/supabase/client');
      
      for (const log of logsToFlush) {
        if (log.level === 'error' || log.level === 'warn') {
          await supabase.rpc('log_sensitive_operation', {
            operation_type: `LOG_${log.level.toUpperCase()}`,
            resource_type: 'application_logs',
            additional_details: {
              message: log.message,
              context: log.context,
              level: log.level,
              timestamp: log.timestamp
            }
          });
        }
      }
    } catch (error) {
      // Don't console.log in production - this could create infinite loops
      if (isDevelopment()) {
        console.error('Failed to flush logs:', error);
      }
    }
  }

  // Replace console methods globally in production
  public static initializeProductionMode(): void {
    if (isProduction()) {
      const logger = ProductionLogger.getInstance();
      
      // Override console methods in production
      window.console = {
        ...window.console,
        log: (message: any, ...args: any[]) => logger.info(String(message), { args }),
        debug: (message: any, ...args: any[]) => logger.debug(String(message), { args }),
        info: (message: any, ...args: any[]) => logger.info(String(message), { args }),
        warn: (message: any, ...args: any[]) => logger.warn(String(message), { args }),
        error: (message: any, ...args: any[]) => logger.error(String(message), { args }),
      };
    }
  }
}

// Export singleton instance
export const productionLogger = ProductionLogger.getInstance();

// Auto-initialize in production
if (isProduction()) {
  ProductionLogger.initializeProductionMode();
}