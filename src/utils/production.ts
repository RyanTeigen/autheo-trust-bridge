// Production utilities for environment-specific behavior

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (import.meta.env.DEV) return 'development';
  if (import.meta.env.PROD) return 'production';
  return 'test';
};

export const debugLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const performanceLog = (operation: string, startTime: number): void => {
  if (isDevelopment()) {
    const duration = performance.now() - startTime;
    console.log(`[PERFORMANCE] ${operation}: ${duration.toFixed(2)}ms`);
  }
};

export const getAPIBaseURL = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
};

export const getAppVersion = (): string => {
  return import.meta.env.VITE_APP_VERSION || '1.0.0';
};

// Error reporting configuration
export const shouldReportError = (error: Error): boolean => {
  // Don't report certain development-only errors
  if (isDevelopment()) {
    return false;
  }
  
  // Filter out known non-critical errors
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'ChunkLoadError'
  ];
  
  return !ignoredErrors.some(ignored => error.message.includes(ignored));
};

// Performance monitoring configuration
export const performanceConfig = {
  enableMetrics: isProduction(),
  sampleRate: isProduction() ? 0.1 : 1.0, // Sample 10% in production, 100% in development
  metricsEndpoint: '/api/metrics',
  batchSize: 50,
  flushInterval: 30000 // 30 seconds
};

// Feature flags
export const featureFlags = {
  enableAdvancedMonitoring: isProduction(),
  enableDebugMode: isDevelopment(),
  enablePerformanceTracking: true,
  enableErrorReporting: isProduction(),
  enableAnalytics: isProduction()
};

// Deployment status tracking
export interface DeploymentStatus {
  environment: string;
  version: string;
  deployedAt: string;
  commitHash: string;
  status: 'deploying' | 'deployed' | 'failed' | 'rollback';
  healthScore: number;
}

import { getEnvironment, getAppVersion } from './environment';

export const getDeploymentStatus = (): DeploymentStatus => {
  return {
    environment: getEnvironment(),
    version: getAppVersion(),
    deployedAt: new Date().toISOString(),
    commitHash: 'latest',
    status: 'deployed',
    healthScore: 95
  };
};

// Production monitoring configuration
export const monitoringConfig = {
  healthCheckInterval: isProduction() ? 60000 : 300000, // 1 min prod, 5 min dev
  metricsCollection: {
    performance: true,
    errors: true,
    security: isProduction(),
    userActivity: true
  },
  alertThresholds: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2 seconds
    memoryUsage: 0.8, // 80%
    diskUsage: 0.9 // 90%
  }
};

// Security configuration for production
export const securityConfig = {
  sessionTimeout: isProduction() ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000, // 30 min prod, 2 hours dev
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireMFA: isProduction(),
  enableAuditLogging: true,
  encryptionLevel: isProduction() ? 'AES-256' : 'AES-128'
};
