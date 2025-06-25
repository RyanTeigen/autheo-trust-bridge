
const crypto = require('crypto');
const { mlkemDecapsulate } = require('../../utils/pq-mlkem');

class DecryptionUtils {
  async decryptRecord(shareRecord, privateKeyB64) {
    if (!privateKeyB64) {
      throw new Error('Private key not provided');
    }

    // Parse the PQ encrypted key
    const encryptedKeyData = JSON.parse(shareRecord.pq_encrypted_key);
    
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
    const encryptedRecord = JSON.parse(shareRecord.medical_records.encrypted_data);
    
    // Decrypt the medical record using AES-GCM
    const decipher = crypto.createDecipherGCM('aes-256-gcm', aesKey);
    decipher.setAuthTag(Buffer.from(encryptedRecord.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedRecord.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  createDecryptedRecordResponse(share, decryptedData) {
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
  }

  createFailedDecryptionResponse(share, error) {
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
      error: error.message || 'Decryption failed'
    };
  }

  createEncryptedRecordResponse(shareRecord) {
    return {
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
    };
  }
}

module.exports = new DecryptionUtils();
