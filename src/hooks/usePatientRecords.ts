
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MedicalRecordsEncryption } from '@/services/encryption/MedicalRecordsEncryption';

interface DecryptedRecord {
  id: string;
  patient_id: string;
  record_type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export const usePatientRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<DecryptedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Call the Supabase function to get patient records
      const { data: rawRecords, error: fetchError } = await supabase
        .rpc('get_patient_records', { current_user_id: user.id });

      if (fetchError) {
        throw fetchError;
      }

      if (!rawRecords || rawRecords.length === 0) {
        setRecords([]);
        return;
      }

      // Decrypt each record
      const decryptedRecords: DecryptedRecord[] = [];
      
      for (const record of rawRecords) {
        try {
          const decryptedData = await MedicalRecordsEncryption.decryptMedicalRecord(
            record.encrypted_data,
            record.iv,
            user.id
          );

          decryptedRecords.push({
            id: record.id,
            patient_id: record.patient_id,
            record_type: record.record_type || 'general',
            data: decryptedData,
            created_at: record.created_at,
            updated_at: record.updated_at
          });
        } catch (decryptError) {
          console.error(`Failed to decrypt record ${record.id}:`, decryptError);
          // Continue with other records even if one fails to decrypt
        }
      }

      setRecords(decryptedRecords);
    } catch (err) {
      console.error('Error fetching patient records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatientRecords();
    }
  }, [user]);

  const refetch = () => {
    fetchPatientRecords();
  };

  return {
    records,
    loading,
    error,
    refetch
  };
};
