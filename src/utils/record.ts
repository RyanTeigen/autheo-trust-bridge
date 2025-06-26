
// src/utils/record.ts
import { supabase } from '@/integrations/supabase/client';

export async function getOrCreateMedicalRecord(userId: string): Promise<string | null> {
  try {
    console.log('Starting getOrCreateMedicalRecord for user:', userId);
    
    // Step 1: Get or create patient record first
    let patientId: string | null = null;
    
    const { data: existingPatient, error: patientFetchError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (patientFetchError) {
      console.error('Error fetching patient:', patientFetchError);
      return null;
    }

    if (existingPatient) {
      patientId = existingPatient.id;
      console.log('Found existing patient:', patientId);
    } else {
      // Create patient record
      console.log('Creating new patient record for user:', userId);
      
      const { data: newPatient, error: patientCreateError } = await supabase
        .from('patients')
        .insert({
          user_id: userId,
          full_name: 'New Patient', // Default name
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (patientCreateError) {
        console.error('Error creating patient:', patientCreateError);
        return null;
      }

      patientId = newPatient.id;
      console.log('Created new patient:', patientId);
    }

    // Step 2: Try to fetch existing medical record
    const { data: existingRecord, error: recordFetchError } = await supabase
      .from('medical_records')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (recordFetchError) {
      console.error('Error fetching medical record:', recordFetchError);
      return null;
    }

    if (existingRecord) {
      console.log('Found existing medical record:', existingRecord.id);
      return existingRecord.id;
    }

    // Step 3: Create new medical record
    console.log('Creating new medical record for user:', userId, 'patient:', patientId);
    
    const { data: newRecord, error: recordCreateError } = await supabase
      .from('medical_records')
      .insert({ 
        user_id: userId,
        patient_id: patientId,
        encrypted_data: '{}', // Empty initial data
        record_type: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (recordCreateError) {
      console.error('Error creating medical record:', recordCreateError);
      return null;
    }

    console.log('Created new medical record:', newRecord.id);
    return newRecord.id;
    
  } catch (error) {
    console.error('Unexpected error in getOrCreateMedicalRecord:', error);
    return null;
  }
}
