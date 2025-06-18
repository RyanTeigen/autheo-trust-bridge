
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/utils/environment';

export const useAuthenticatedFetch = () => {
  return useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // If endpoint starts with http(s), use it as-is, otherwise prepend API_BASE_URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }, []);
};
