import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedRecord {
  shareId: string;
  recordId: string;
  sharedAt: string;
  pqEncryptedKey: string;
  record: {
    id: string;
    encryptedData: string;
    recordType: string;
    createdAt: string;
    updatedAt: string;
    patient: {
      id: string;
      name: string;
      email: string;
      userId: string;
    };
  };
}

export interface DecryptedSharedRecord extends SharedRecord {
  decryptionStatus: 'encrypted' | 'decrypted' | 'failed';
  decryptedData?: any;
  message?: string;
  error?: string;
  record: {
    id: string;
    encryptedData?: string;
    recordType: string;
    createdAt: string;
    updatedAt: string;
    decryptedData?: any;
    patient: {
      id: string;
      name: string;
      email: string;
      userId?: string;
    };
  };
}

export const useSharedRecordsAPI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSharedRecords = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch('/api/shared-records', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data.sharedRecords as SharedRecord[],
          count: result.data.count
        };
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch shared records",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: "Failed to fetch shared records",
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getDecryptedSharedRecords = async (privateKey?: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      // Add private key to headers if provided
      if (privateKey) {
        headers['x-private-key'] = privateKey;
      }

      const response = await fetch('/api/shared-records/decrypted', {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data.sharedRecords as DecryptedSharedRecord[],
          count: result.data.count
        };
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch decrypted shared records",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: "Failed to fetch decrypted shared records",
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const decryptSharedRecord = async (shareId: string, privateKey?: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      // Add private key to headers if provided
      if (privateKey) {
        headers['x-private-key'] = privateKey;
      }

      const response = await fetch(`/api/shared-records/${shareId}/decrypt`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data as DecryptedSharedRecord
        };
      } else {
        toast({
          title: "Decryption Failed",
          description: result.error || "Failed to decrypt shared record",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: "Failed to decrypt shared record",
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getSharedRecords,
    getDecryptedSharedRecords,
    decryptSharedRecord
  };
};
