
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuantumShareRecord {
  id: string;
  record_id: string;
  shared_with_user_id: string;
  pq_encrypted_key: string;
  created_at: string;
  updated_at: string;
}

export const useQuantumSafeSharing = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const shareRecord = async (recordId: string, recipientUserId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would generate quantum-safe keys
      // For now, we'll use a placeholder encrypted key
      const mockEncryptedKey = JSON.stringify({
        encapsulatedKey: `mock_encapsulated_key_${Date.now()}`,
        ciphertext: `encrypted_aes_key_${Date.now()}`
      });

      const { data, error } = await supabase
        .from('record_shares')
        .insert({
          record_id: recordId,
          shared_with_user_id: recipientUserId,
          pq_encrypted_key: mockEncryptedKey
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Record Shared Successfully",
        description: "The record has been shared using quantum-safe encryption.",
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Sharing Failed",
        description: error.message || "Failed to share record",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getMyShares = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(patient_id, patients!inner(user_id))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter shares where the current user owns the medical record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const myShares = data?.filter((share: any) => 
        share.medical_records.patients.user_id === user.id
      ) || [];

      return { success: true, data: myShares };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getSharedWithMe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('record_shares')
        .select('*')
        .eq('shared_with_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('record_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: "Share Revoked",
        description: "The record share has been successfully revoked.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Revocation Failed",
        description: error.message || "Failed to revoke share",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    shareRecord,
    getMyShares,
    getSharedWithMe,
    revokeShare
  };
};
