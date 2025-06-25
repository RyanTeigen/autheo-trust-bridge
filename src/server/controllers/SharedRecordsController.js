
const SharedRecordsService = require('../services/SharedRecordsService');
const DecryptionUtils = require('../utils/DecryptionUtils');

class SharedRecordsController {
  async getSharedRecords(req, res) {
    try {
      const userId = req.user.id;
      
      const sharedRecords = await SharedRecordsService.getSharedRecords(userId);

      // Log access to audit trail for each record accessed
      for (const share of sharedRecords) {
        await SharedRecordsService.logAccess(share.record_id, userId, req);
      }

      // Transform the data for easier frontend consumption
      const transformedRecords = SharedRecordsService.transformRecordsForResponse(sharedRecords);

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
        error: error.message || 'Internal server error' 
      });
    }
  }

  async getDecryptedSharedRecords(req, res) {
    try {
      const userId = req.user.id;
      
      const sharedRecords = await SharedRecordsService.getSharedRecords(userId);

      // Decrypt each record
      const decryptedRecords = await Promise.all(
        sharedRecords.map(async (share) => {
          try {
            // Log access to audit trail and blockchain
            await SharedRecordsService.logAccess(share.record_id, userId, req);

            // Get provider's private key from header
            const privateKeyB64 = req.headers['x-private-key'];
            
            if (!privateKeyB64) {
              console.warn(`No private key provided for decryption of record ${share.record_id}`);
              return DecryptionUtils.createFailedDecryptionResponse(share, new Error('Private key not provided'));
            }

            // Decrypt the record
            const decryptedData = await DecryptionUtils.decryptRecord(share, privateKeyB64);
            return DecryptionUtils.createDecryptedRecordResponse(share, decryptedData);

          } catch (decryptError) {
            console.error(`Failed to decrypt record ${share.record_id}:`, decryptError);
            return DecryptionUtils.createFailedDecryptionResponse(share, decryptError);
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
        error: error.message || 'Internal server error' 
      });
    }
  }

  async decryptSpecificRecord(req, res) {
    try {
      const { shareId } = req.params;
      const userId = req.user.id;

      const shareRecord = await SharedRecordsService.getSharedRecordById(shareId, userId);

      // Log access to audit trail and blockchain
      await SharedRecordsService.logAccess(shareRecord.record_id, userId, req);

      // Try to decrypt with provider's private key
      try {
        const privateKeyB64 = req.headers['x-private-key'];
        
        if (!privateKeyB64) {
          const response = DecryptionUtils.createEncryptedRecordResponse(shareRecord);
          return res.json({
            success: true,
            data: response
          });
        }

        // Decrypt the record
        const decryptedData = await DecryptionUtils.decryptRecord(shareRecord, privateKeyB64);

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
      res.status(error.message.includes('not found') ? 404 : 500).json({ 
        success: false, 
        error: error.message || 'Failed to decrypt shared record' 
      });
    }
  }
}

module.exports = new SharedRecordsController();
