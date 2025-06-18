
import { useCallback } from 'react';
import { useAuthenticatedFetch } from './use-authenticated-fetch';

interface MedicalRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

interface MedicalRecordCreateInput {
  title: string;
  description?: string;
  category?: string;
  notes?: string;
  recordType?: string;
  [key: string]: any;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface RecordFilters {
  recordType?: string;
}

export const useMedicalRecordsAPI = () => {
  const authenticatedFetch = useAuthenticatedFetch();

  const getRecords = useCallback(async (options: PaginationOptions = {}, filters: RecordFilters = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (filters.recordType) params.append('recordType', filters.recordType);
    
    const response = await authenticatedFetch(`/api/medical-records?${params}`);
    return response.json();
  }, [authenticatedFetch]);

  const getRecord = useCallback(async (id: string) => {
    const response = await authenticatedFetch(`/api/medical-records/${id}`);
    return response.json();
  }, [authenticatedFetch]);

  const createRecord = useCallback(async (data: MedicalRecordCreateInput) => {
    const response = await authenticatedFetch('/api/medical-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const updateRecord = useCallback(async (id: string, data: Partial<MedicalRecordCreateInput>) => {
    const response = await authenticatedFetch(`/api/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const deleteRecord = useCallback(async (id: string) => {
    const response = await authenticatedFetch(`/api/medical-records/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }, [authenticatedFetch]);

  return {
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};
