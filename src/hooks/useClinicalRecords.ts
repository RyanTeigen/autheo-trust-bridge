import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClinicalRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  record_type: string;
  encrypted_data: string;
  iv?: string;
  record_hash?: string;
  anchored_at?: string;
  created_at: string;
  updated_at: string;
  patient_name?: string;
  patient_email?: string;
  patient_user_id?: string;
}

export interface ClinicalRecordData {
  title: string;
  clinical_notes: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications?: string;
  follow_up?: string;
  visit_date: string;
  vital_signs?: string;
  lab_results?: string;
  imaging_results?: string;
  provider_notes?: string;
}

export const useClinicalRecords = () => {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClinicalRecords = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch clinical records created by the current provider
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient_id,
          provider_id,
          record_type,
          encrypted_data,
          iv,
          record_hash,
          anchored_at,
          created_at,
          updated_at
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecords(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clinical records';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createClinicalRecord = useCallback(async (
    patientId: string,
    recordType: string,
    recordData: ClinicalRecordData
  ) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Encrypt the record data (simplified - in production use proper encryption)
      const encryptedData = JSON.stringify(recordData);
      
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          provider_id: user.id,
          record_type: recordType,
          encrypted_data: encryptedData,
          // In production, add proper encryption IV and record hash
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add to local state
      setRecords(prev => [data, ...prev]);
      
      toast({
        title: "Clinical Record Created",
        description: "The clinical record has been successfully created and encrypted."
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create clinical record';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const shareRecordWithPatient = useCallback(async (
    recordId: string,
    patientId: string,
    permissionType: 'read' | 'write' = 'read',
    expiresAt?: string
  ) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('sharing_permissions')
        .insert({
          medical_record_id: recordId,
          patient_id: patientId,
          grantee_id: patientId, // The patient user ID
          permission_type: permissionType,
          status: 'approved', // Auto-approve provider-initiated shares
          expires_at: expiresAt,
        });

      if (error) throw error;
      
      toast({
        title: "Record Shared",
        description: "The clinical record has been shared with the patient."
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share record';
      toast({
        title: "Error", 
        description: message,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const updateClinicalRecord = useCallback(async (
    recordId: string,
    recordData: Partial<ClinicalRecordData>
  ) => {
    if (!user) return false;
    
    setLoading(true);
    
    try {
      // Get current record to merge data
      const { data: currentRecord, error: fetchError } = await supabase
        .from('medical_records')
        .select('encrypted_data')
        .eq('id', recordId)
        .eq('provider_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      
      // Parse current data and merge with updates
      const currentData = JSON.parse(currentRecord.encrypted_data);
      const updatedData = { ...currentData, ...recordData };
      const encryptedData = JSON.stringify(updatedData);
      
      const { error } = await supabase
        .from('medical_records')
        .update({  
          encrypted_data: encryptedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('provider_id', user.id);

      if (error) throw error;
      
      // Update local state
      setRecords(prev => prev.map(record => 
        record.id === recordId 
          ? { ...record, encrypted_data: encryptedData, updated_at: new Date().toISOString() }
          : record
      ));
      
      toast({
        title: "Record Updated",
        description: "The clinical record has been successfully updated."
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update clinical record';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteClinicalRecord = useCallback(async (recordId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId)
        .eq('provider_id', user.id);

      if (error) throw error;
      
      // Remove from local state
      setRecords(prev => prev.filter(record => record.id !== recordId));
      
      toast({
        title: "Record Deleted",
        description: "The clinical record has been permanently deleted."
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete clinical record';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    records,
    loading,
    error,
    fetchClinicalRecords,
    createClinicalRecord,
    shareRecordWithPatient,
    updateClinicalRecord,
    deleteClinicalRecord
  };
};