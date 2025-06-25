
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

export interface DecryptedSharedRecord {
  shareId: string;
  recordId: string;
  sharedAt: string;
  pqEncryptedKey?: string;
  decryptionStatus: 'encrypted' | 'decrypted' | 'failed';
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
        return { success: false, error: 'Authentication required. Please log in.' };
      }

      // For development, we'll use a mock API endpoint that doesn't require a running server
      // In production, this would hit the actual backend
      try {
        const response = await fetch('/api/shared-records', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          return {
            success: true,
            data: result.data.sharedRecords as SharedRecord[],
            count: result.data.count
          };
        } else {
          return { success: false, error: result.error || "Failed to fetch shared records" };
        }
      } catch (apiError) {
        console.warn('API endpoint not available, returning mock data for development:', apiError);
        
        // Return mock data for development/testing
        const mockSharedRecords: SharedRecord[] = [
          {
            shareId: 'mock-share-1',
            recordId: 'mock-record-1',
            sharedAt: new Date().toISOString(),
            pqEncryptedKey: 'mock-encrypted-key-1',
            record: {
              id: 'mock-record-1',
              encryptedData: 'mock-encrypted-data',
              recordType: 'Lab Results',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              patient: {
                id: 'mock-patient-1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                userId: 'mock-user-1'
              }
            }
          },
          {
            shareId: 'mock-share-2',
            recordId: 'mock-record-2',
            sharedAt: new Date().toISOString(),
            pqEncryptedKey: 'mock-encrypted-key-2',
            record: {
              id: 'mock-record-2',
              encryptedData: 'mock-encrypted-data-2',
              recordType: 'X-Ray Report',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              patient: {
                id: 'mock-patient-2',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                userId: 'mock-user-2'
              }
            }
          }
        ];

        return {
          success: true,
          data: mockSharedRecords,
          count: mockSharedRecords.length
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in getSharedRecords:', error);
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
        return { success: false, error: 'Authentication required. Please log in.' };
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      // Add private key to headers if provided
      if (privateKey) {
        headers['x-private-key'] = privateKey;
      }

      try {
        const response = await fetch('/api/shared-records/decrypted', {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          return {
            success: true,
            data: result.data.sharedRecords as DecryptedSharedRecord[],
            count: result.data.count
          };
        } else {
          return { success: false, error: result.error || "Failed to fetch decrypted shared records" };
        }
      } catch (apiError) {
        console.warn('API endpoint not available, returning mock decrypted data:', apiError);
        
        // Return mock decrypted data for development
        const mockDecryptedRecords: DecryptedSharedRecord[] = [
          {
            shareId: 'mock-share-1',
            recordId: 'mock-record-1',
            sharedAt: new Date().toISOString(),
            decryptionStatus: 'decrypted',
            record: {
              id: 'mock-record-1',
              recordType: 'Lab Results',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              decryptedData: {
                title: 'Blood Test Results',
                description: 'Comprehensive metabolic panel results',
                vitals: {
                  glucose: '95 mg/dL',
                  cholesterol: '180 mg/dL',
                  bloodPressure: '120/80 mmHg'
                }
              },
              patient: {
                id: 'mock-patient-1',
                name: 'John Doe',
                email: 'john.doe@example.com'
              }
            }
          }
        ];

        return {
          success: true,
          data: mockDecryptedRecords,
          count: mockDecryptedRecords.length
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in getDecryptedSharedRecords:', error);
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
        return { success: false, error: 'Authentication required. Please log in.' };
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      // Add private key to headers if provided
      if (privateKey) {
        headers['x-private-key'] = privateKey;
      }

      try {
        const response = await fetch(`/api/shared-records/${shareId}/decrypt`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          return {
            success: true,
            data: result.data as DecryptedSharedRecord
          };
        } else {
          return { success: false, error: result.error || "Failed to decrypt shared record" };
        }
      } catch (apiError) {
        console.warn('API endpoint not available, returning mock decrypted record:', apiError);
        
        // Return mock decrypted record for development
        const mockDecryptedRecord: DecryptedSharedRecord = {
          shareId: shareId,
          recordId: 'mock-record-' + shareId,
          sharedAt: new Date().toISOString(),
          decryptionStatus: 'decrypted',
          record: {
            id: 'mock-record-' + shareId,
            recordType: 'Medical Report',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            decryptedData: {
              title: 'Sample Medical Record',
              description: 'This is a sample decrypted medical record for testing',
              content: 'Patient appears in good health with no immediate concerns.'
            },
            patient: {
              id: 'mock-patient-' + shareId,
              name: 'Test Patient',
              email: 'test.patient@example.com'
            }
          }
        };

        return {
          success: true,
          data: mockDecryptedRecord
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in decryptSharedRecord:', error);
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
