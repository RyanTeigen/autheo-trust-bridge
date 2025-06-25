
import { supabase } from '@/integrations/supabase/client';
import { MedicalRecord } from '@/types/medical';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface MedicalRecordFilters {
  recordType?: string;
  patientId?: string;
}

export class MedicalRecordsRepository {
  static async create(
    patientId: string, 
    encryptedData: { encrypted_data: string; iv: string }, 
    recordType: string
  ): Promise<{ id: string }> {
    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        encrypted_data: encryptedData.encrypted_data,
        iv: encryptedData.iv,
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

  static async findByPatientId(
    patientId: string, 
    options: PaginationOptions = {},
    filters: MedicalRecordFilters = {}
  ): Promise<MedicalRecord[]> {
    const limit = Math.min(Math.max(options.limit || 10, 1), 100);
    const offset = Math.max(options.offset || 0, 0);

    let query = supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId);

    if (filters.recordType) {
      query = query.eq('record_type', filters.recordType);
    }

    const { data: records, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return records || [];
  }

  static async findByPatientIdWithPatients(
    patientId: string, 
    options: PaginationOptions = {},
    filters: MedicalRecordFilters = {}
  ): Promise<(MedicalRecord & { patients: { user_id: string } })[]> {
    const limit = Math.min(Math.max(options.limit || 10, 1), 100);
    const offset = Math.max(options.offset || 0, 0);

    let query = supabase
      .from('medical_records')
      .select('*, patients!inner(user_id)')
      .eq('patient_id', patientId);

    if (filters.recordType) {
      query = query.eq('record_type', filters.recordType);
    }

    const { data: records, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return records as (MedicalRecord & { patients: { user_id: string } })[] || [];
  }

  static async update(
    id: string, 
    encryptedData: { encrypted_data: string; iv: string }
  ): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .update({
        encrypted_data: encryptedData.encrypted_data,
        iv: encryptedData.iv,
        updated_at: new Date().toISOString()
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

  static async countByPatientId(patientId: string, filters: MedicalRecordFilters = {}): Promise<number> {
    let query = supabase
      .from('medical_records')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', patientId);

    if (filters.recordType) {
      query = query.eq('record_type', filters.recordType);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  }
}
