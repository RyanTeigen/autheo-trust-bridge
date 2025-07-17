import { useCallback } from 'react';
import { useAuthenticatedFetch } from './use-authenticated-fetch';

interface EnhancedAccessRequestInput {
  patientEmail: string;
  requestType: 'standard' | 'emergency' | 'cross_hospital' | 'research' | 'consultation';
  urgencyLevel: 'low' | 'normal' | 'high' | 'critical';
  hospitalId?: string;
  department?: string;
  clinicalJustification: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

interface AccessRequestResult {
  id: string;
  patientEmail: string;
  patientName?: string;
  requestType: string;
  urgencyLevel: string;
  status: string;
  requestedAt: string;
  expiresAt?: string;
  clinicalJustification: string;
  hospitalId?: string;
  department?: string;
}

export const useEnhancedAccessRequestAPI = () => {
  const authenticatedFetch = useAuthenticatedFetch();

  const createEnhancedAccessRequest = useCallback(async (data: EnhancedAccessRequestInput) => {
    const response = await authenticatedFetch('/api/access/enhanced-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const getEnhancedAccessRequests = useCallback(async () => {
    const response = await authenticatedFetch('/api/access/enhanced-requests');
    return response.json();
  }, [authenticatedFetch]);

  const sendReminder = useCallback(async (requestId: string) => {
    const response = await authenticatedFetch(`/api/access/enhanced-request/${requestId}/reminder`, {
      method: 'POST',
    });
    return response.json();
  }, [authenticatedFetch]);

  const getRequestAuditTrail = useCallback(async (requestId: string) => {
    const response = await authenticatedFetch(`/api/access/enhanced-request/${requestId}/audit`);
    return response.json();
  }, [authenticatedFetch]);

  return {
    createEnhancedAccessRequest,
    getEnhancedAccessRequests,
    sendReminder,
    getRequestAuditTrail,
  };
};