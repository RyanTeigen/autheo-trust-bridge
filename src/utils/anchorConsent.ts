import { supabase } from "@/integrations/supabase/client";

export interface ConsentData {
  userDid?: string;
  requester: string;
  dataTypes: string[];
  duration: string;
  timestamp: string;
  userId?: string;
}

export async function anchorConsentToBlockchain(
  consentHash: string,
  consentData: ConsentData
): Promise<string> {
  try {
    // Parse duration if it's a string (e.g., "30 days" -> interval)
    let durationInterval = null;
    if (consentData.duration) {
      // Convert duration string to PostgreSQL interval format
      const durationMatch = consentData.duration.match(/(\d+)\s*(days?|hours?|minutes?)/i);
      if (durationMatch) {
        const [, number, unit] = durationMatch;
        durationInterval = `${number} ${unit.toLowerCase()}`;
      }
    }

    // Insert the consent record into the consents table
    const { data: consentRecord, error: consentError } = await supabase
      .from('consents')
      .insert({
        user_did: consentData.userDid,
        requester: consentData.requester,
        data_types: consentData.dataTypes,
        duration: durationInterval,
        timestamp: consentData.timestamp
      })
      .select()
      .single();

    if (consentError) {
      throw new Error(`Failed to create consent record: ${consentError.message}`);
    }

    // Insert the consent hash into the hash_anchor_queue table
    // This will be picked up by the blockchain anchoring process
    const { data: queueData, error: queueError } = await supabase
      .from('hash_anchor_queue')
      .insert({
        record_type: 'consent',
        hash: consentHash,
        patient_id: consentData.userId,
        metadata: {
          consent_id: consentRecord.id,
          requester: consentData.requester,
          dataTypes: consentData.dataTypes,
          duration: consentData.duration,
          timestamp: consentData.timestamp,
          userDid: consentData.userDid
        }
      })
      .select()
      .single();

    if (queueError) {
      throw new Error(`Failed to queue consent for anchoring: ${queueError.message}`);
    }

    // Create audit log for the consent action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: consentData.userId,
        action: 'CONSENT_GRANTED',
        resource: 'consent',
        resource_id: consentRecord.id,
        status: 'success',
        details: `User granted consent to ${consentData.requester} for data types: ${consentData.dataTypes.join(', ')}`,
        metadata: {
          hash: consentHash,
          consent_id: consentRecord.id,
          queue_id: queueData.id,
          requester: consentData.requester,
          dataTypes: consentData.dataTypes,
          duration: consentData.duration
        }
      });

    return consentRecord.id;
  } catch (error) {
    console.error('Error anchoring consent:', error);
    throw error;
  }
}