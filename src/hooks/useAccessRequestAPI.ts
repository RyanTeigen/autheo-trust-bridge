
import { useCallback } from 'react';
import { useAuthenticatedFetch } from './use-authenticated-fetch';

interface AccessRequestInput {
  patientEmail: string;
}

interface AccessRequestResult {
  id: string;
  patientEmail: string;
  requestedAt: string;
  status: 'pending';
}

interface AccessRequest {
  id: string;
  patientEmail: string;
  patientName: string;
  permissionType: string;
  requestedAt: string;
  expiresAt: string | null;
  recordType: string;
  status: 'active' | 'expired';
}

export const useAccessRequestAPI = () => {
  const authenticatedFetch = useAuthenticatedFetch();

  const requestPatientAccess = useCallback(async (data: AccessRequestInput) => {
    const response = await authenticatedFetch('/api/access/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const getMyAccessRequests = useCallback(async () => {
    const response = await authenticatedFetch('/api/access/requests');
    return response.json();
  }, [authenticatedFetch]);

  return {
    requestPatientAccess,
    getMyAccessRequests,
  };
};
