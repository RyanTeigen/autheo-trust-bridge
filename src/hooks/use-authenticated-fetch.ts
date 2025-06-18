
import { useCallback } from 'react';
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';

export const useAuthenticatedFetch = () => {
  const { token } = useFrontendAuth();

  return useCallback(async (url: string, options: RequestInit = {}) => {
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
