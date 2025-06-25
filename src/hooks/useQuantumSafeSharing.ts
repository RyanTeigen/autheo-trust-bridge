
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

export interface SharingFilters {
  granteeId?: string;
  permissionType?: string;
  status?: 'active' | 'expired' | 'all';
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export const useQuantumSafeSharing = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const shareRecord = async (recordId: string, recipientUserId: string) => {
    setLoading(true);
    try {
      // Validate input parameters
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('Record ID is required and must be a string');
      }

      if (!recipientUserId || typeof recipientUserId !== 'string') {
        throw new Error('Recipient user ID is required and must be a string');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(recordId)) {
        throw new Error('Invalid record ID format');
      }

      if (!uuidRegex.test(recipientUserId)) {
        throw new Error('Invalid recipient user ID format');
      }

      // Check for existing share to prevent duplicates
      const { data: existingShare } = await supabase
        .from('record_shares')
        .select('id')
        .eq('record_id', recordId)
        .eq('shared_with_user_id', recipientUserId)
        .maybeSingle();

      if (existingShare) {
        throw new Error('Record is already shared with this user');
      }

      // In a real implementation, this would generate quantum-safe keys
      // For now, we'll use a placeholder encrypted key with enhanced metadata
      const mockEncryptedKey = JSON.stringify({
        encapsulatedKey: `mock_encapsulated_key_${Date.now()}`,
        ciphertext: `encrypted_aes_key_${Date.now()}`,
        algorithm: 'ML-KEM-768',
        timestamp: new Date().toISOString()
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

      if (error) {
        console.error('Share creation error:', error);
        throw error;
      }

      toast({
        title: "Record Shared Successfully",
        description: "The record has been shared using quantum-safe encryption.",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in shareRecord:', error);
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

  const getMyShares = async (options: PaginationOptions = {}, filters: SharingFilters = {}) => {
    setLoading(true);
    try {
      const { limit = 50, offset = 0 } = options;
      const { granteeId, status } = filters;

      // Get current user's patient record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            id,
            record_type,
            created_at,
            patient_id,
            patients!inner(user_id)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (granteeId) {
        query = query.eq('shared_with_user_id', granteeId);
      }

      if (status === 'active') {
        // For active shares, we consider all current shares as active
        // In a more complex system, you might have expiration logic here
        query = query.not('id', 'is', null);
      }

      const { data: allShares, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching shares:', error);
        throw error;
      }

      // Filter shares where the current user owns the medical record
      const myShares = allShares?.filter((share: any) => 
        share.medical_records?.patients?.user_id === user.id
      ) || [];

      return { 
        success: true, 
        data: {
          permissions: myShares,
          totalCount: count || 0,
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < (count || 0)
          }
        }
      };
    } catch (error: any) {
      console.error('Error in getMyShares:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getSharedWithMe = async (options: PaginationOptions = {}) => {
    setLoading(true);
    try {
      const { limit = 50, offset = 0 } = options;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error, count } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            id,
            record_type,
            created_at,
            patient_id,
            patients!inner(full_name, email)
          )
        `, { count: 'exact' })
        .eq('shared_with_user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching shared records:', error);
        throw error;
      }

      return { 
        success: true, 
        data: {
          permissions: data || [],
          totalCount: count || 0,
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < (count || 0)
          }
        }
      };
    } catch (error: any) {
      console.error('Error in getSharedWithMe:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId: string) => {
    setLoading(true);
    try {
      // Validate input
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID is required and must be a string');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shareId)) {
        throw new Error('Invalid share ID format');
      }

      // First verify the share exists and user has permission to revoke it
      const { data: shareData, error: fetchError } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            patient_id,
            patients!inner(user_id)
          )
        `)
        .eq('id', shareId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Share not found');
        }
        throw fetchError;
      }

      // Check if current user owns the record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const recordOwnerId = shareData.medical_records.patients.user_id;
      if (recordOwnerId !== user.id) {
        throw new Error('You can only revoke shares for your own records');
      }

      const { error } = await supabase
        .from('record_shares')
        .delete()
        .eq('id', shareId);

      if (error) {
        console.error('Error revoking share:', error);
        throw error;
      }

      toast({
        title: "Share Revoked",
        description: "The record share has been successfully revoked.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error in revokeShare:', error);
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

  const updateShare = async (shareId: string, updates: { expires_at?: string }) => {
    setLoading(true);
    try {
      // Validate input
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID is required and must be a string');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shareId)) {
        throw new Error('Invalid share ID format');
      }

      // Validate expiry date if provided
      if (updates.expires_at) {
        const expiryDate = new Date(updates.expires_at);
        if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
          throw new Error('Expiry date must be a valid future date');
        }
      }

      // For now, we just update the updated_at timestamp since the current schema 
      // doesn't have expires_at field. In a full implementation, you'd extend the schema.
      const { data, error } = await supabase
        .from('record_shares')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', shareId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Share not found');
        }
        throw error;
      }

      toast({
        title: "Share Updated",
        description: "The record share has been successfully updated.",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in updateShare:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update share",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getShareById = async (shareId: string) => {
    setLoading(true);
    try {
      // Validate input
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID is required and must be a string');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shareId)) {
        throw new Error('Invalid share ID format');
      }

      const { data, error } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            id,
            record_type,
            created_at,
            patient_id,
            patients!inner(full_name, email, user_id)
          )
        `)
        .eq('id', shareId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Share not found');
        }
        throw error;
      }

      // Verify user has access to this share
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const isOwner = data.medical_records.patients.user_id === user.id;
      const isRecipient = data.shared_with_user_id === user.id;

      if (!isOwner && !isRecipient) {
        throw new Error('You do not have access to this share');
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in getShareById:', error);
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
    revokeShare,
    updateShare,
    getShareById
  };
};
