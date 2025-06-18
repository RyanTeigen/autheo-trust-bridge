
import { supabase } from '@/integrations/supabase/client';
import { MedicalRecord } from '@/types/medical';

export class MedicalRecordsRepository {
  static async create(patientId: string, encryptedData: string, recordType: string): Promise<{ id: string }> {
    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        encrypted_data: encryptedData,
        record_type: recordType
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { id: record.id };
  }

  static async findById(id: string): Promise<MedicalRecord & { patients: { user_id: string } }> {
    const { data: record, error } = await supabase
      .from('medical_records')
      .select('*, patients!inner(user_id)')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return record as MedicalRecord & { patients: { user_id: string } };
  }

  static async update(id: string, encryptedData: string): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .update({
        encrypted_data: encryptedData
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
