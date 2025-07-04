
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
      // Create patient record - the fixed RLS policies now allow this properly
      console.log('Creating new patient record for user:', userId);
      
      // Generate a proper UUID for the patient
      const newPatientId = crypto.randomUUID();
      
      const { data: newPatient, error: patientCreateError } = await supabase
        .from('patients')
        .insert({
          id: newPatientId,
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

    // Step 2: Try to fetch existing medical record (use limit(1) to handle potential duplicates)
    const { data: existingRecords, error: recordFetchError } = await supabase
      .from('medical_records')
      .select('id')
      .eq('user_id', userId)
      .eq('record_type', 'general')
      .limit(1);

    if (recordFetchError) {
      console.error('Error fetching medical record:', recordFetchError);
      return null;
    }

    if (existingRecords && existingRecords.length > 0) {
      console.log('Found existing medical record:', existingRecords[0].id);
      return existingRecords[0].id;
    }

    // Step 3: Create new medical record with conflict handling
    console.log('Creating new medical record for user:', userId, 'patient:', patientId);
    
    try {
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
        // If we get a unique constraint violation, try to fetch the existing record
        if (recordCreateError.code === '23505') {
          console.log('Record already exists due to race condition, fetching existing record');
          const { data: existingRecord } = await supabase
            .from('medical_records')
            .select('id')
            .eq('user_id', userId)
            .eq('record_type', 'general')
            .limit(1)
            .single();
          
          if (existingRecord) {
            console.log('Found existing record after conflict:', existingRecord.id);
            return existingRecord.id;
          }
        }
        
        console.error('Error creating medical record:', recordCreateError);
        return null;
      }

      console.log('Created new medical record:', newRecord.id);
      return newRecord.id;
    } catch (error) {
      console.error('Error in medical record creation:', error);
      return null;
    }
    
  } catch (error) {
    console.error('Unexpected error in getOrCreateMedicalRecord:', error);
    return null;
  }
}
