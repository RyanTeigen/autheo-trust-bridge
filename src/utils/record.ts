
// src/utils/record.ts
import { supabase } from '@/integrations/supabase/client';

export async function getOrCreateMedicalRecord(userId: string): Promise<string | null> {
  try {
    // Step 1: Try to fetch existing record
    const { data, error } = await supabase
      .from('medical_records')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching medical record:', error);
      return null;
    }

    if (data) {
      console.log('Found existing medical record:', data.id);
      return data.id;
    }

    // Step 2: Create new medical record
    const { data: created, error: insertErr } = await supabase
      .from('medical_records')
      .insert({ 
        user_id: userId,
        encrypted_data: '{}', // Empty initial data
        record_type: 'general'
      })
      .select()
      .maybeSingle();

    if (insertErr) {
      console.error('Error creating medical record:', insertErr);
      return null;
    }

    if (created) {
      console.log('Created new medical record:', created.id);
      return created.id;
    }

    return null;
  } catch (error) {
    console.error('Unexpected error in getOrCreateMedicalRecord:', error);
    return null;
  }
}
