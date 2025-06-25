
const { supabase } = require('../../integrations/supabase/client');
const { publishAuditLogToChain } = require('../../utils/publish-audit-log');

class SharedRecordsService {
  async getSharedRecords(userId) {
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
      throw new Error('Failed to fetch shared records: ' + error.message);
    }

    return sharedRecords;
  }

  async getSharedRecordById(shareId, userId) {
    const { data: shareRecord, error } = await supabase
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

    if (error || !shareRecord) {
      throw new Error('Shared record not found or access denied');
    }

    return shareRecord;
  }

  async logAccess(recordId, userId, req) {
    try {
      await publishAuditLogToChain({
        recordId: recordId,
        accessedBy: userId,
        timestamp: new Date().toISOString(),
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
      });
    } catch (auditError) {
      console.error('Failed to publish audit log to blockchain:', auditError);
      // Don't fail the request if audit logging fails
    }
  }

  transformRecordsForResponse(sharedRecords) {
    return sharedRecords.map(share => ({
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
  }
}

module.exports = new SharedRecordsService();
