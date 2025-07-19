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
    // Insert the consent hash into the hash_anchor_queue table
    // This will be picked up by the blockchain anchoring process
    const { data, error } = await supabase
      .from('hash_anchor_queue')
      .insert({
        record_type: 'consent',
        hash: consentHash,
        patient_id: consentData.userId,
        metadata: {
          requester: consentData.requester,
          dataTypes: consentData.dataTypes,
          duration: consentData.duration,
          timestamp: consentData.timestamp,
          userDid: consentData.userDid
        }
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to queue consent for anchoring: ${error.message}`);
    }

    // Create audit log for the consent action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: consentData.userId,
        action: 'CONSENT_GRANTED',
        resource: 'consent',
        resource_id: data.id,
        status: 'success',
        details: `User granted consent to ${consentData.requester} for data types: ${consentData.dataTypes.join(', ')}`,
        metadata: {
          hash: consentHash,
          requester: consentData.requester,
          dataTypes: consentData.dataTypes,
          duration: consentData.duration
        }
      });

    return data.id;
  } catch (error) {
    console.error('Error anchoring consent:', error);
    throw error;
  }
}