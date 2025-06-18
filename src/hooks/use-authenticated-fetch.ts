
import { useCallback } from 'react';
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';
import { API_BASE_URL } from '@/utils/environment';

export const useAuthenticatedFetch = () => {
  const { token } = useFrontendAuth();

  return useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // If endpoint starts with http(s), use it as-is, otherwise prepend API_BASE_URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }, [token]);
};
