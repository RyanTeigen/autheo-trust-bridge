
import { AuditLogEntry, AuditLogType } from './audit/AuditLogEntry';
import { 
  getCurrentUser,
  getIpAddress,
  generateId,
  getBrowserInfo,
  getUserLocation
} from './audit/utils';

// In a real application, this would be persisted to a secure database
// with encryption and access controls in place
let auditLogs: AuditLogEntry[] = [];

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
  
  // Query methods
  getLogs: (): AuditLogEntry[] => [...auditLogs],
  getLogsByType: (type: AuditLogType): AuditLogEntry[] => auditLogs.filter(log => log.type === type),
  getLogsByStatus: (status: 'success' | 'warning' | 'error'): AuditLogEntry[] => auditLogs.filter(log => log.status === status),
  getLogsByResourceId: (resourceId: string): AuditLogEntry[] => auditLogs.filter(log => log.resourceId === resourceId),
  getLogsByUser: (user: string): AuditLogEntry[] => auditLogs.filter(log => log.user === user),
  
  getLogsByDateRange: (startDate: Date, endDate: Date): AuditLogEntry[] => {
    return auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  },

  clearLogs: (): void => {
    auditLogs = [];
  }
};

export default AuditLogService;
