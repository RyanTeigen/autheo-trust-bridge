
const express = require('express');
const { supabase } = require('../../integrations/supabase/client');
const authMiddleware = require('../middleware/auth');
const { mlkemDecapsulate } = require('../../utils/pq-mlkem');
const crypto = require('crypto');

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

// NEW ROUTE: GET /api/shared-records/decrypted - Get all shared records with decryption
router.get('/decrypted', authMiddleware, async (req, res) => {
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

    // Decrypt each record
    const decryptedRecords = await Promise.all(
      sharedRecords.map(async (share) => {
        try {
          // Get provider's private key from local storage simulation
          // In production, this would be securely retrieved from the provider's secure storage
          const privateKeyB64 = req.headers['x-private-key']; // Temporary header for private key
          
          if (!privateKeyB64) {
            console.warn(`No private key provided for decryption of record ${share.record_id}`);
            return {
              shareId: share.id,
              recordId: share.record_id,
              sharedAt: share.created_at,
              record: {
                id: share.medical_records.id,
                recordType: share.medical_records.record_type,
                createdAt: share.medical_records.created_at,
                updatedAt: share.medical_records.updated_at,
                patient: {
                  id: share.medical_records.patients.id,
                  name: share.medical_records.patients.full_name,
                  email: share.medical_records.patients.email
                }
              },
              decryptionStatus: 'failed',
              error: 'Private key not provided'
            };
          }

          // Parse the PQ encrypted key
          const encryptedKeyData = JSON.parse(share.pq_encrypted_key);
          
          // Decrypt the AES key using ML-KEM
          const sharedSecretHex = await mlkemDecapsulate(
            encryptedKeyData.ciphertext, 
            privateKeyB64
          );
          
          // Convert shared secret to AES key
          const aesKey = crypto.createHash('sha256')
            .update(Buffer.from(sharedSecretHex, 'hex'))
            .digest();

          // Parse the encrypted medical record data
          const encryptedRecord = JSON.parse(share.medical_records.encrypted_data);
          
          // Decrypt the medical record using AES-GCM
          const decipher = crypto.createDecipherGCM('aes-256-gcm', aesKey);
          decipher.setAuthTag(Buffer.from(encryptedRecord.authTag, 'hex'));
          
          let decrypted = decipher.update(encryptedRecord.encryptedData, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          
          const decryptedData = JSON.parse(decrypted);

          return {
            shareId: share.id,
            recordId: share.record_id,
            sharedAt: share.created_at,
            record: {
              id: share.medical_records.id,
              recordType: share.medical_records.record_type,
              createdAt: share.medical_records.created_at,
              updatedAt: share.medical_records.updated_at,
              decryptedData: decryptedData,
              patient: {
                id: share.medical_records.patients.id,
                name: share.medical_records.patients.full_name,
                email: share.medical_records.patients.email
              }
            },
            decryptionStatus: 'success'
          };

        } catch (decryptError) {
          console.error(`Failed to decrypt record ${share.record_id}:`, decryptError);
          return {
            shareId: share.id,
            recordId: share.record_id,
            sharedAt: share.created_at,
            record: {
              id: share.medical_records.id,
              recordType: share.medical_records.record_type,
              createdAt: share.medical_records.created_at,
              updatedAt: share.medical_records.updated_at,
              patient: {
                id: share.medical_records.patients.id,
                name: share.medical_records.patients.full_name,
                email: share.medical_records.patients.email
              }
            },
            decryptionStatus: 'failed',
            error: decryptError.message
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        sharedRecords: decryptedRecords,
        count: decryptedRecords.length
      }
    });

  } catch (error) {
    console.error('Error in decrypted shared records endpoint:', error);
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

    // Try to decrypt with provider's private key
    try {
      const privateKeyB64 = req.headers['x-private-key']; // Temporary header for private key
      
      if (!privateKeyB64) {
        return res.json({
          success: true,
          data: {
            shareId: shareRecord.id,
            recordId: shareRecord.record_id,
            sharedAt: shareRecord.created_at,
            record: {
              id: shareRecord.medical_records.id,
              recordType: shareRecord.medical_records.record_type,
              createdAt: shareRecord.medical_records.created_at,
              updatedAt: shareRecord.medical_records.updated_at,
              encryptedData: shareRecord.medical_records.encrypted_data,
              pqEncryptedKey: shareRecord.pq_encrypted_key,
              patient: {
                id: shareRecord.medical_records.patients.id,
                name: shareRecord.medical_records.patients.full_name,
                email: shareRecord.medical_records.patients.email
              }
            },
            decryptionStatus: 'encrypted',
            message: 'Private key required for decryption'
          }
        });
      }

      // Parse the PQ encrypted key and decrypt
      const encryptedKeyData = JSON.parse(shareRecord.pq_encrypted_key);
      const sharedSecretHex = await mlkemDecapsulate(
        encryptedKeyData.ciphertext, 
        privateKeyB64
      );
      
      // Convert to AES key and decrypt the record
      const aesKey = crypto.createHash('sha256')
        .update(Buffer.from(sharedSecretHex, 'hex'))
        .digest();

      const encryptedRecord = JSON.parse(shareRecord.medical_records.encrypted_data);
      const decipher = crypto.createDecipherGCM('aes-256-gcm', aesKey);
      decipher.setAuthTag(Buffer.from(encryptedRecord.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedRecord.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const decryptedData = JSON.parse(decrypted);

      const response = {
        shareId: shareRecord.id,
        recordId: shareRecord.record_id,
        sharedAt: shareRecord.created_at,
        record: {
          id: shareRecord.medical_records.id,
          recordType: shareRecord.medical_records.record_type,
          createdAt: shareRecord.medical_records.created_at,
          updatedAt: shareRecord.medical_records.updated_at,
          decryptedData: decryptedData,
          patient: {
            id: shareRecord.medical_records.patients.id,
            name: shareRecord.medical_records.patients.full_name,
            email: shareRecord.medical_records.patients.email
          }
        },
        decryptionStatus: 'decrypted',
        message: 'Record decrypted successfully using quantum-safe cryptography'
      };

      res.json({
        success: true,
        data: response
      });

    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      
      // Return encrypted data if decryption fails
      const response = {
        shareId: shareRecord.id,
        recordId: shareRecord.record_id,
        sharedAt: shareRecord.created_at,
        record: {
          id: shareRecord.medical_records.id,
          recordType: shareRecord.medical_records.record_type,
          createdAt: shareRecord.medical_records.created_at,
          updatedAt: shareRecord.medical_records.updated_at,
          encryptedData: shareRecord.medical_records.encrypted_data,
          pqEncryptedKey: shareRecord.pq_encrypted_key,
          patient: {
            id: shareRecord.medical_records.patients.id,
            name: shareRecord.medical_records.patients.full_name,
            email: shareRecord.medical_records.patients.email
          }
        },
        decryptionStatus: 'failed',
        error: 'Decryption failed: ' + decryptError.message
      };

      res.json({
        success: true,
        data: response
      });
    }

  } catch (error) {
    console.error('Error decrypting shared record:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to decrypt shared record' 
    });
  }
});

module.exports = router;
