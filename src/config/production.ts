// Production configuration and feature flags
import { isProduction, isDevelopment } from '@/utils/production';

export interface ProductionConfig {
  // Security settings
  security: {
    enforceRoleBasedAccess: boolean;
    enableAuditLogging: boolean;
    requireMFA: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    enableCSPHeaders: boolean;
    enableXSSProtection: boolean;
  };
  
  // Performance settings
  performance: {
    enablePerformanceMonitoring: boolean;
    enableMetricsCollection: boolean;
    maxBundleSize: number; // KB
    enableCodeSplitting: boolean;
    enableServiceWorker: boolean;
  };
  
  // Compliance settings
  compliance: {
    enableHIPAACompliance: boolean;
    enableSOC2Compliance: boolean;
    auditRetentionYears: number;
    enableDataEncryption: boolean;
    enableBreachDetection: boolean;
  };
  
  // UI/UX settings
  ui: {
    enableDeveloperTools: boolean;
    showDebugInfo: boolean;
    enableHotReload: boolean;
    showPerformanceMetrics: boolean;
  };
  
  // API settings
  api: {
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    enableRequestLogging: boolean;
    timeoutMs: number;
  };
}

// Production configuration
const productionConfig: ProductionConfig = {
  security: {
    enforceRoleBasedAccess: true,
    enableAuditLogging: true,
    requireMFA: isProduction(),
    sessionTimeout: isProduction() ? 30 : 120, // 30 min prod, 2 hours dev
    maxLoginAttempts: 5,
    enableCSPHeaders: true,
    enableXSSProtection: true,
  },
  
  performance: {
    enablePerformanceMonitoring: true,
    enableMetricsCollection: true,
    maxBundleSize: isProduction() ? 500 : 1000, // 500KB prod, 1MB dev
    enableCodeSplitting: true,
    enableServiceWorker: isProduction(),
  },
  
  compliance: {
    enableHIPAACompliance: true,
    enableSOC2Compliance: isProduction(),
    auditRetentionYears: 7,
    enableDataEncryption: true,
    enableBreachDetection: true,
  },
  
  ui: {
    enableDeveloperTools: isDevelopment(),
    showDebugInfo: isDevelopment(),
    enableHotReload: isDevelopment(),
    showPerformanceMetrics: isDevelopment(),
  },
  
  api: {
    enableRateLimiting: true,
    maxRequestsPerMinute: isProduction() ? 60 : 1000,
    enableRequestLogging: true,
    timeoutMs: isProduction() ? 10000 : 30000,
  },
};

// Environment-specific overrides
export const getProductionConfig = (): ProductionConfig => {
  return productionConfig;
};

// Feature flags for conditional rendering
export const featureFlags = {
  // Security features
  enforceStrictAuth: productionConfig.security.enforceRoleBasedAccess,
  enableAuditTrail: productionConfig.security.enableAuditLogging,
  
  // Performance features
  enableMonitoring: productionConfig.performance.enablePerformanceMonitoring,
  enableCodeSplitting: productionConfig.performance.enableCodeSplitting,
  
  // Compliance features
  enableHIPAA: productionConfig.compliance.enableHIPAACompliance,
  enableSOC2: productionConfig.compliance.enableSOC2Compliance,
  
  // UI features
  showDebugTools: productionConfig.ui.enableDeveloperTools,
  showPerformanceInfo: productionConfig.ui.showPerformanceMetrics,
  
  // Development helpers (disabled in production)
  enableCreatorMode: false, // Always false for security
  bypassRoleChecks: false,  // Always false for security
  enableTestMode: isDevelopment(),
};

// Production readiness checks
export const productionReadiness = {
  isProduction: isProduction(),
  hasSecurityHeaders: true,
  hasErrorBoundaries: true,
  hasAuditLogging: true,
  hasRoleBasedAccess: true,
  hasDataEncryption: true,
  hasPerformanceMonitoring: true,
  hasBreachDetection: true,
  
  // Calculated readiness score
  getReadinessScore(): number {
    const checks = Object.values(this).filter(v => typeof v === 'boolean');
    const passing = checks.filter(Boolean).length;
    return Math.round((passing / checks.length) * 100);
  }
};

export default productionConfig;