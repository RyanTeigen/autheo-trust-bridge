import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PatientRightsRequest {
  id: string;
  patient_id: string;
  request_type: 'access' | 'amendment' | 'restriction' | 'accounting' | 'portability';
  status: 'pending' | 'in_progress' | 'completed' | 'denied';
  description?: string;
  requested_data?: string[];
  justification?: string;
  response_due_date?: string;
  completed_at?: string;
  handled_by?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function usePatientRights() {
  const [requests, setRequests] = useState<PatientRightsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patient_rights_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const transformedData: PatientRightsRequest[] = (data || []).map(request => ({
        ...request,
        request_type: request.request_type as PatientRightsRequest['request_type'],
        status: request.status as PatientRightsRequest['status'],
        metadata: request.metadata as Record<string, any>
      }));
      setRequests(transformedData);
    } catch (err: any) {
      console.error('Error fetching patient rights requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: {
    request_type: PatientRightsRequest['request_type'];
    description?: string;
    requested_data?: string[];
    justification?: string;
  }) => {
    try {
      // Get current user to find their patient record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get patient ID
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Calculate response due date (30 days from now as per HIPAA)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { error: insertError } = await supabase
        .from('patient_rights_requests')
        .insert({
          patient_id: patient.id,
          response_due_date: dueDate.toISOString(),
          ...requestData
        });

      if (insertError) {
        throw insertError;
      }

      // Refresh the data
      await fetchRequests();
    } catch (err: any) {
      console.error('Error creating patient rights request:', err);
      throw err;
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: PatientRightsRequest['status'],
    handledBy?: string
  ) => {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (handledBy) {
        updates.handled_by = handledBy;
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('patient_rights_requests')
        .update(updates)
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      // Refresh the data
      await fetchRequests();
    } catch (err: any) {
      console.error('Error updating request status:', err);
      throw err;
    }
  };

  const getPendingCount = () => {
    return requests.filter(req => req.status === 'pending').length;
  };

  const getOverdueCount = () => {
    const now = new Date();
    return requests.filter(req => 
      req.status !== 'completed' && 
      req.response_due_date && 
      new Date(req.response_due_date) < now
    ).length;
  };

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequestStatus,
    getPendingCount,
    getOverdueCount
  };
}