
const express = require('express');
const { supabase } = require('../../integrations/supabase/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/shared-records - Get records shared with the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get records shared with this user
    const { data: sharedRecords, error } = await supabase
      .from('record_shares')
      .select(`
        *,
        medical_records!inner(
          id,
          encrypted_data,
          record_type,
          created_at,
          updated_at,
          patients!inner(
            id,
            full_name,
            email,
            user_id
          )
        )
      `)
      .eq('shared_with_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shared records:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch shared records' 
      });
    }

    // Transform the data for easier frontend consumption
    const transformedRecords = sharedRecords.map(share => ({
      shareId: share.id,
      recordId: share.record_id,
      sharedAt: share.created_at,
      pqEncryptedKey: share.pq_encrypted_key,
      record: {
        id: share.medical_records.id,
        encryptedData: share.medical_records.encrypted_data,
        recordType: share.medical_records.record_type,
        createdAt: share.medical_records.created_at,
        updatedAt: share.medical_records.updated_at,
        patient: {
          id: share.medical_records.patients.id,
          name: share.medical_records.patients.full_name,
          email: share.medical_records.patients.email,
          userId: share.medical_records.patients.user_id
        }
      }
    }));

    res.json({
      success: true,
      data: {
        sharedRecords: transformedRecords,
        count: transformedRecords.length
      }
    });

  } catch (error) {
    console.error('Error in shared records endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/shared-records/:shareId/decrypt - Decrypt a specific shared record
router.get('/:shareId/decrypt', authMiddleware, async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id;

    // Get the specific share record
    const { data: shareRecord, error: shareError } = await supabase
      .from('record_shares')
      .select(`
        *,
        medical_records!inner(
          id,
          encrypted_data,
          record_type,
          created_at,
          updated_at,
          patients!inner(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', shareId)
      .eq('shared_with_user_id', userId)
      .single();

    if (shareError || !shareRecord) {
      return res.status(404).json({ 
        success: false, 
        error: 'Shared record not found or access denied' 
      });
    }

    // For now, we'll return the encrypted data with metadata
    // In a full implementation, this would decrypt using the provider's private key
    const response = {
      shareId: shareRecord.id,
      recordId: shareRecord.record_id,
      sharedAt: shareRecord.created_at,
      record: {
        id: shareRecord.medical_records.id,
        recordType: shareRecord.medical_records.record_type,
        createdAt: shareRecord.medical_records.created_at,
        updatedAt: shareRecord.medical_records.updated_at,
        // Note: In production, decrypt the encrypted_data here using provider's private key
        encryptedData: shareRecord.medical_records.encrypted_data,
        pqEncryptedKey: shareRecord.pq_encrypted_key,
        patient: {
          id: shareRecord.medical_records.patients.id,
          name: shareRecord.medical_records.patients.full_name,
          email: shareRecord.medical_records.patients.email
        }
      },
      decryptionStatus: 'encrypted', // Would be 'decrypted' after implementing full decryption
      message: 'Record retrieved successfully. Decryption requires provider private key implementation.'
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error decrypting shared record:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to decrypt shared record' 
    });
  }
});

module.exports = router;
