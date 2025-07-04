import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MedicalRecordsEncryption } from '@/services/encryption/MedicalRecordsEncryption';

interface ProviderRecord {
  id: string;
  patient_id: string;
  record_type: string;
  encrypted_data: string;
  iv: string;
  created_at: string;
  updated_at: string;
  record_hash?: string;
  decrypted_data?: any;
}

export function useProviderRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviderRecords = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get records created by this provider (user)
      const { data: rawRecords, error: fetchError } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient_id,
          record_type,
          encrypted_data,
          iv,
          created_at,
          updated_at,
          record_hash,
          patients!inner (
            id,
            full_name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(rawRecords || []);
    } catch (err) {
      console.error('Error fetching provider records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const decryptRecord = useCallback(async (recordId: string) => {
    if (!user?.id) return null;

    try {
      const record = records.find(r => r.id === recordId);
      if (!record) throw new Error('Record not found');

      const decryptedData = await MedicalRecordsEncryption.decryptMedicalRecord(
        record.encrypted_data,
        record.iv,
        user.id
      );

      // Update the record with decrypted data
      setRecords(prev => prev.map(r => 
        r.id === recordId 
          ? { ...r, decrypted_data: decryptedData }
          : r
      ));

      return decryptedData;
    } catch (err) {
      console.error('Error decrypting record:', err);
      throw err;
    }
  }, [records, user?.id]);

  useEffect(() => {
    fetchProviderRecords();
  }, [fetchProviderRecords]);

  const refetch = fetchProviderRecords;

  return {
    records,
    loading,
    error,
    refetch,
    decryptRecord
  };
}