
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from './useAuditLog';
import { AccessLogger } from '@/services/audit/AccessLogger';

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  recordType: string;
  data?: any;
  created_at: string;
  updated_at: string;
}

interface CreateMedicalRecordData {
  title: string;
  description?: string;
  recordType?: string;
  [key: string]: any;
}

interface UpdateMedicalRecordData {
  title?: string;
  description?: string;
  recordType?: string;
  [key: string]: any;
}

interface GetRecordsOptions {
  limit?: number;
  offset?: number;
  recordType?: string;
}

export const useMedicalRecordsAPI = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { logAccess, logCreate, logUpdate, logDelete, logError } = useAuditLog();

  const getRecords = async (options: GetRecordsOptions = {}) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const { limit = 50, offset = 0, recordType } = options;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (recordType && recordType !== 'all') {
        params.append('recordType', recordType);
      }

      const response = await fetch(`/api/medical-records?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        // Log successful access
        await logAccess('medical_records', undefined, `Retrieved ${result.data.records.length} records`);
        return result;
      } else {
        await logError('GET_RECORDS', 'medical_records', result.error);
        return result;
      }
    } catch (error) {
      await logError('GET_RECORDS', 'medical_records', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error fetching medical records:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const getRecord = async (id: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/medical-records/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        await logAccess('medical_record', id, `Accessed record: ${result.data.data.title || 'Untitled'}`);
        
        // Also log to access_logs table for medical record access tracking
        if (result.data.data.patient_id) {
          await AccessLogger.logRecordView(id, result.data.data.patient_id, user?.id);
        }
        
        return result;
      } else {
        await logError('GET_RECORD', 'medical_record', result.error, id);
        return result;
      }
    } catch (error) {
      await logError('GET_RECORD', 'medical_record', error instanceof Error ? error.message : 'Unknown error', id);
      console.error('Error fetching medical record:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: CreateMedicalRecordData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        await logCreate('medical_record', result.data.id, `Created record: ${data.title}`);
        return result;
      } else {
        await logError('CREATE_RECORD', 'medical_record', result.error);
        return result;
      }
    } catch (error) {
      await logError('CREATE_RECORD', 'medical_record', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error creating medical record:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id: string, data: UpdateMedicalRecordData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/medical-records/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        await logUpdate('medical_record', id, `Updated record: ${data.title || 'Untitled'}`);
        return result;
      } else {
        await logError('UPDATE_RECORD', 'medical_record', result.error, id);
        return result;
      }
    } catch (error) {
      await logError('UPDATE_RECORD', 'medical_record', error instanceof Error ? error.message : 'Unknown error', id);
      console.error('Error updating medical record:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/medical-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        await logDelete('medical_record', id, 'Deleted medical record');
        return result;
      } else {
        await logError('DELETE_RECORD', 'medical_record', result.error, id);
        return result;
      }
    } catch (error) {
      await logError('DELETE_RECORD', 'medical_record', error instanceof Error ? error.message : 'Unknown error', id);
      console.error('Error deleting medical record:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord
  };
};
