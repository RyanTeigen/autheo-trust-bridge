
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
