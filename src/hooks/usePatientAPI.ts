
import { useCallback } from 'react';
import { useAuthenticatedFetch } from './use-authenticated-fetch';

interface Patient {
  id: string;
  full_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
}

interface PatientCreateInput {
  full_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export const usePatientAPI = () => {
  const authenticatedFetch = useAuthenticatedFetch();

  const getPatients = useCallback(async (options: PaginationOptions = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    
    const response = await authenticatedFetch(`/api/patients?${params}`);
    return response.json();
  }, [authenticatedFetch]);

  const getCurrentPatient = useCallback(async () => {
    const response = await authenticatedFetch('/api/patients/current');
    return response.json();
  }, [authenticatedFetch]);

  const getPatient = useCallback(async (id: string) => {
    const response = await authenticatedFetch(`/api/patients/${id}`);
    return response.json();
  }, [authenticatedFetch]);

  const createPatient = useCallback(async (data: PatientCreateInput) => {
    const response = await authenticatedFetch('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const updatePatient = useCallback(async (id: string, data: Partial<PatientCreateInput>) => {
    const response = await authenticatedFetch(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }, [authenticatedFetch]);

  const deletePatient = useCallback(async (id: string) => {
    const response = await authenticatedFetch(`/api/patients/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }, [authenticatedFetch]);

  return {
    getPatients,
    getCurrentPatient,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
