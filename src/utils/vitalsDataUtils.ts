
import { supabase } from '@/integrations/supabase/client';
import { decryptWithKey } from '@/utils/atomicDecryption';

interface VitalsDataPoint {
  label: string;
  value: number;
}

export async function fetchAndFormatVitals(
  dataType: string, 
  userId: string, 
  encryptionKey: string
): Promise<VitalsDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from('atomic_data_points')
      .select('created_at, enc_value')
      .eq('owner_id', userId)
      .eq('data_type', dataType)
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) {
      console.error(`Failed to fetch ${dataType} data:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => ({
      label: new Date(row.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      value: Number(decryptWithKey(row.enc_value, encryptionKey)),
    }));
  } catch (err) {
    console.error(`Error processing ${dataType} data:`, err);
    return [];
  }
}
