
// Production environment configuration and detection
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

// Backend API configuration using Supabase Edge Functions
export const API_BASE_URL = 'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/api';

export const getAPIEndpoint = (): string => {
  const env = getEnvironment();
  
  switch (env) {
    case Environment.PRODUCTION:
      return 'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/api';
    case Environment.STAGING:
      return 'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/api';
    default:
      return 'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/api';
  }
};

export const getAppVersion = (): string => {
  return '1.0.0'; // Will be replaced by CI/CD
};

export const getBuildInfo = () => ({
  version: getAppVersion(),
  environment: getEnvironment(),
  buildTime: new Date().toISOString(),
  commitHash: 'latest' // Will be replaced by CI/CD
});
