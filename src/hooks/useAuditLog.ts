
import { useCallback } from 'react';
import { auditLogger } from '@/services/audit/AuditLogger';

export const useAuditLog = () => {
  const logAccess = useCallback(async (resource: string, resourceId?: string, details?: string) => {
    await auditLogger.logAccess(resource, resourceId, details);
  }, []);

  const logCreate = useCallback(async (resource: string, resourceId?: string, details?: string) => {
    await auditLogger.logCreate(resource, resourceId, details);
  }, []);

  const logUpdate = useCallback(async (resource: string, resourceId?: string, details?: string) => {
    await auditLogger.logUpdate(resource, resourceId, details);
  }, []);

  const logDelete = useCallback(async (resource: string, resourceId?: string, details?: string) => {
    await auditLogger.logDelete(resource, resourceId, details);
  }, []);

  const logError = useCallback(async (action: string, resource: string, error: string, resourceId?: string) => {
    await auditLogger.logError(action, resource, error, resourceId);
  }, []);

  const logWarning = useCallback(async (action: string, resource: string, warning: string, resourceId?: string) => {
    await auditLogger.logWarning(action, resource, warning, resourceId);
  }, []);

  const logCustomEvent = useCallback(async (
    action: string,
    resource: string,
    status: 'success' | 'warning' | 'error',
    resourceId?: string,
    details?: string
  ) => {
    await auditLogger.logEvent({
      action,
      resource,
      resource_id: resourceId,
      status,
      details
    });
  }, []);

  return {
    logAccess,
    logCreate,
    logUpdate,
    logDelete,
    logError,
    logWarning,
    logCustomEvent
  };
};
