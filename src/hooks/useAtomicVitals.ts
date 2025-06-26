
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { decryptWithKey } from '@/utils/atomicDecryption';
import { getVitalColor } from '@/components/patient/vital-signs/VitalIcon';

interface AtomicDataPoint {
  id: string;
  data_type: string;
  enc_value: string;
  unit?: string;
  created_at: string;
}

interface DecryptedVital {
  type: string;
  value: string;
  unit?: string;
  dataType: string;
  color: string;
}

export const useAtomicVitals = () => {
  const [vitals, setVitals] = useState<AtomicDataPoint[]>([]);
  const [decryptedVitals, setDecryptedVitals] = useState<DecryptedVital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const formatDataType = (dataType: string): string => {
    return dataType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchVitals = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('atomic_data_points')
          .select('id, data_type, enc_value, unit, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Failed to fetch vitals:', error);
          setError('Failed to fetch vital signs data');
          return;
        }

        setVitals(data || []);
      } catch (err) {
        console.error('Error fetching vitals:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [user]);

  useEffect(() => {
    if (!vitals.length) return;

    const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                         localStorage.getItem(`encryption_key_${user?.id}`);

    if (!encryptionKey) {
      setError('Encryption key not found. Please log in again.');
      return;
    }

    try {
      const decrypted = vitals.map(vital => ({
        type: formatDataType(vital.data_type),
        value: decryptWithKey(vital.enc_value, encryptionKey),
        unit: vital.unit,
        dataType: vital.data_type,
        color: getVitalColor(vital.data_type)
      }));

      setDecryptedVitals(decrypted);
    } catch (err) {
      console.error('Error decrypting vitals:', err);
      setError('Failed to decrypt vital signs data');
    }
  }, [vitals, user]);

  return {
    vitals,
    decryptedVitals,
    loading,
    error
  };
};
