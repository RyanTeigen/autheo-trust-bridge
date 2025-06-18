
// Environment configuration
export const API_BASE_URL = 'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1';

// Supabase configuration
export const SUPABASE_URL = 'https://ilhzzroafedbyttdfypf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHp6cm9hZmVkYnl0dGRmeXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjAzMzIsImV4cCI6MjA2Mjg5NjMzMn0.N7JqBYswLPuQAUPbyCPjjK9Ij2dRKMzn6l4fxyLIMKA';

// Environment detection
export const Environment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging', 
  PRODUCTION: 'production'
} as const;

export type EnvironmentType = typeof Environment[keyof typeof Environment];

export const getEnvironment = (): EnvironmentType => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return Environment.DEVELOPMENT;
  }
  
  if (hostname.includes('staging') || hostname.includes('preview')) {
    return Environment.STAGING;
  }
  
  return Environment.PRODUCTION;
};

export const isProduction = (): boolean => getEnvironment() === Environment.PRODUCTION;
export const isStaging = (): boolean => getEnvironment() === Environment.STAGING;
export const isDevelopment = (): boolean => getEnvironment() === Environment.DEVELOPMENT;

export const getAppVersion = (): string => {
  return '1.0.0'; // Will be replaced by CI/CD
};

export const getBuildInfo = () => ({
  version: getAppVersion(),
  environment: getEnvironment(),
  buildTime: new Date().toISOString(),
  commitHash: 'latest' // Will be replaced by CI/CD
});
