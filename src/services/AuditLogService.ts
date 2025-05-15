
import { AuditLogType } from '@/components/ui/AuditLogItem';

export interface AuditLogEntry {
  id: string;
  type: AuditLogType;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  ipAddress?: string;
  resourceId?: string;
  duration?: number;
  location?: string;
  browser?: string;
  os?: string;
}

// In a real application, this would be persisted to a secure database
// with encryption and access controls in place
let auditLogs: AuditLogEntry[] = [];

// Mock function to get the current user - would be from auth context in real app
const getCurrentUser = (): string => {
  return 'Dr. Sarah Johnson'; // Example user
};

// Mock function to get the current IP address
const getIpAddress = (): string => {
  return '192.168.1.100'; // In a real app, this would be obtained differently
};

// Generate a unique ID for each log entry
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get browser and OS information
const getBrowserInfo = (): { browser: string; os: string } => {
  // In a real app, this would use proper user-agent parsing
  return {
    browser: 'Chrome',
    os: 'Windows'
  };
};

// Get user's location (in a real app, this could be more precise)
const getUserLocation = (): string => {
  return 'New York, NY'; // Example location
};

export const AuditLogService = {
  /**
   * Log a patient record access event
   */
  logPatientAccess: (
    patientId: string, 
    patientName: string, 
    action: string, 
    status: 'success' | 'warning' | 'error' = 'success',
    details?: string,
    duration?: number
  ): void => {
    const browserInfo = getBrowserInfo();
    const logEntry: AuditLogEntry = {
      id: generateId(),
      type: 'access',
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      action: action,
      resource: `Patient: ${patientName} (${patientId})`,
      resourceId: patientId,
      status: status,
      details: details,
      ipAddress: getIpAddress(),
      duration: duration,
      location: getUserLocation(),
      browser: browserInfo.browser,
      os: browserInfo.os
    };
    
    auditLogs.unshift(logEntry);
    console.log('HIPAA Audit Log:', logEntry);
    
    // In a real application, you would persist this to a secure database
    // and potentially send it to a monitoring service
  },
  
  /**
   * Log a data disclosure event (when patient data is shared)
   */
  logDisclosure: (
    patientId: string, 
    patientName: string, 
    recipient: string, 
    reason: string,
    status: 'success' | 'warning' | 'error' = 'success'
  ): void => {
    const browserInfo = getBrowserInfo();
    const logEntry: AuditLogEntry = {
      id: generateId(),
      type: 'disclosure',
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      action: `Disclosed patient data to ${recipient}`,
      resource: `Patient: ${patientName} (${patientId})`,
      resourceId: patientId,
      status: status,
      details: `Reason: ${reason}`,
      ipAddress: getIpAddress(),
      location: getUserLocation(),
      browser: browserInfo.browser,
      os: browserInfo.os
    };
    
    auditLogs.unshift(logEntry);
    console.log('HIPAA Audit Log:', logEntry);
  },
  
  /**
   * Log an amendment to patient records
   */
  logAmendment: (
    patientId: string,
    patientName: string,
    field: string,
    oldValue: string,
    newValue: string,
    status: 'success' | 'warning' | 'error' = 'success'
  ): void => {
    const browserInfo = getBrowserInfo();
    const logEntry: AuditLogEntry = {
      id: generateId(),
      type: 'amendment',
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      action: `Modified ${field}`,
      resource: `Patient: ${patientName} (${patientId})`,
      resourceId: patientId,
      status: status,
      details: `Changed from "${oldValue}" to "${newValue}"`,
      ipAddress: getIpAddress(),
      location: getUserLocation(),
      browser: browserInfo.browser,
      os: browserInfo.os
    };
    
    auditLogs.unshift(logEntry);
    console.log('HIPAA Audit Log:', logEntry);
  },
  
  /**
   * Log a security event (login, logout, failed attempt)
   */
  logSecurityEvent: (
    type: 'login' | 'logout' | 'breach' | 'access',
    action: string,
    status: 'success' | 'warning' | 'error',
    details?: string
  ): void => {
    const browserInfo = getBrowserInfo();
    const logEntry: AuditLogEntry = {
      id: generateId(),
      type: type,
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      action: action,
      resource: 'System Security',
      status: status,
      details: details,
      ipAddress: getIpAddress(),
      location: getUserLocation(),
      browser: browserInfo.browser,
      os: browserInfo.os
    };
    
    auditLogs.unshift(logEntry);
    console.log('HIPAA Audit Log:', logEntry);
  },
  
  /**
   * Log administrative actions
   */
  logAdminAction: (
    action: string,
    resource: string,
    status: 'success' | 'warning' | 'error' = 'success',
    details?: string
  ): void => {
    const browserInfo = getBrowserInfo();
    const logEntry: AuditLogEntry = {
      id: generateId(),
      type: 'admin',
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      action: action,
      resource: resource,
      status: status,
      details: details,
      ipAddress: getIpAddress(),
      location: getUserLocation(),
      browser: browserInfo.browser,
      os: browserInfo.os
    };
    
    auditLogs.unshift(logEntry);
    console.log('HIPAA Audit Log:', logEntry);
  },
  
  /**
   * Get all audit logs
   */
  getLogs: (): AuditLogEntry[] => {
    return [...auditLogs];
  },
  
  /**
   * Filter logs by type
   */
  getLogsByType: (type: AuditLogType): AuditLogEntry[] => {
    return auditLogs.filter(log => log.type === type);
  },

  /**
   * Get logs by status
   */
  getLogsByStatus: (status: 'success' | 'warning' | 'error'): AuditLogEntry[] => {
    return auditLogs.filter(log => log.status === status);
  },

  /**
   * Get logs by resource ID
   */
  getLogsByResourceId: (resourceId: string): AuditLogEntry[] => {
    return auditLogs.filter(log => log.resourceId === resourceId);
  },

  /**
   * Get logs by user
   */
  getLogsByUser: (user: string): AuditLogEntry[] => {
    return auditLogs.filter(log => log.user === user);
  },

  /**
   * Get logs by date range
   */
  getLogsByDateRange: (startDate: Date, endDate: Date): AuditLogEntry[] => {
    return auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  },

  /**
   * Clear all logs
   * In a real HIPAA-compliant system, this would be restricted or unavailable
   * as audit logs should typically be immutable
   */
  clearLogs: (): void => {
    auditLogs = [];
  }
};

export default AuditLogService;
