import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RecordSharingAuditLogger } from '@/services/audit/RecordSharingAuditLogger';

interface Share {
  id: string;
  provider_id: string;
  record_id: string;
  granted_at: string;
  provider_name: string;
  record_title: string;
}

interface Provider {
  id: string;
  name: string;
}

interface MedicalRecord {
  id: string;
  record_type: string;
}

export function useRecordSharing() {
  const [shares, setShares] = useState<Share[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  async function fetchShares() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          grantee_id,
          medical_record_id,
          created_at,
          medical_records!inner(record_type),
          profiles!inner(first_name, last_name)
        `)
        .eq('patient_id', user.id);

      if (error) throw error;
      
      const transformedShares = data?.map(share => ({
        id: share.id,
        provider_id: share.grantee_id,
        record_id: share.medical_record_id,
        granted_at: share.created_at,
        provider_name: `${(share.profiles as any).first_name} ${(share.profiles as any).last_name}`,
        record_title: (share.medical_records as any).record_type
      })) || [];

      setShares(transformedShares);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function fetchProvidersAndRecords() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [provRes, recRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'provider'),
        supabase
          .from('medical_records')
          .select('id, record_type')
          .eq('user_id', user.id)
      ]);

      if (provRes.error) throw provRes.error;
      if (recRes.error) throw recRes.error;

      const transformedProviders = provRes.data?.map(provider => ({
        id: provider.id,
        name: `${provider.first_name} ${provider.last_name}`
      })) || [];

      setProviders(transformedProviders);
      setRecords(recRes.data || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function shareRecord(providerId: string, recordIds: string[]) {
    if (!user?.id) {
      setError('No authenticated user');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Get provider name for audit logging
      const { data: providerData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', providerId)
        .single();

      const providerName = providerData 
        ? `${providerData.first_name} ${providerData.last_name}`
        : 'Unknown Provider';

      for (const recordId of recordIds) {
        // Get record type for audit logging
        const { data: recordData } = await supabase
          .from('medical_records')
          .select('record_type')
          .eq('id', recordId)
          .single();

        const recordType = recordData?.record_type || 'Unknown';

        const { error } = await supabase
          .from('sharing_permissions')
          .insert({
            patient_id: user.id,
            grantee_id: providerId,
            medical_record_id: recordId,
            permission_type: 'read'
          });
        
        if (error) {
          // Log failed share attempt
          await RecordSharingAuditLogger.logShareAttemptFailed(
            recordType,
            providerName,
            error.message
          );
          throw error;
        } else {
          // Log successful share
          await RecordSharingAuditLogger.logRecordShared(
            recordId,
            recordType,
            providerId,
            providerName,
            true
          );
        }
      }
      
      await fetchShares();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function revokeShare(shareId: string) {
    setLoading(true);
    setError(null);
    try {
      // Get share details for audit logging before deletion
      const { data: shareData } = await supabase
        .from('sharing_permissions')
        .select(`
          grantee_id,
          medical_records!inner(record_type),
          profiles!inner(first_name, last_name)
        `)
        .eq('id', shareId)
        .single();

      const recordType = shareData ? (shareData.medical_records as any).record_type : 'Unknown';
      const providerName = shareData 
        ? `${(shareData.profiles as any).first_name} ${(shareData.profiles as any).last_name}`
        : 'Unknown Provider';

      const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', shareId);
      
      if (error) {
        throw error;
      } else {
        // Log successful revocation
        await RecordSharingAuditLogger.logRecordShareRevoked(
          shareId,
          recordType,
          providerName,
          true
        );
      }
      
      await fetchShares();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user?.id) {
      fetchProvidersAndRecords();
      fetchShares();
    }
  }, [user?.id]);

  return {
    shares,
    providers,
    records,
    loading,
    error,
    shareRecord,
    revokeShare,
  };
}
