import { supabase } from "@/integrations/supabase/client";
import { sha256 } from 'js-sha256';

export interface ConsentRevocationData {
  consentId: string;
  userId?: string;
  reason?: string;
  revokedBy: string;
  timestamp: string;
}

export interface RevocationEvent {
  id: string;
  consent_id: string;
  revoked_by: string;
  reason?: string;
  revoked_at: string;
  revocation_hash: string;
  blockchain_tx_hash?: string;
  created_at: string;
}

export async function revokeConsent(
  consentId: string,
  reason?: string
): Promise<{ revocationId: string; revocationHash: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, verify the consent exists and belongs to the user
    const { data: consent, error: consentError } = await supabase
      .from('consents')
      .select('*')
      .eq('id', consentId)
      .single();

    if (consentError || !consent) {
      throw new Error('Consent record not found or access denied');
    }

    // Check if already revoked
    if (consent.revoked) {
      throw new Error('Consent has already been revoked');
    }

    const timestamp = new Date().toISOString();

    // Create revocation data for hashing
    const revocationData: ConsentRevocationData = {
      consentId,
      userId: user.id,
      reason,
      revokedBy: user.id,
      timestamp
    };

    // Generate hash for the revocation event
    const revocationHash = sha256(JSON.stringify(revocationData));

    // Update the consent record to mark it as revoked
    const { error: updateError } = await supabase
      .from('consents')
      .update({
        revoked: true,
        revoked_at: timestamp,
        updated_at: timestamp
      })
      .eq('id', consentId);

    if (updateError) {
      throw new Error(`Failed to update consent record: ${updateError.message}`);
    }

    // Create a revocation event record (for audit trail)
    const { data: revocationEvent, error: revocationError } = await supabase
      .from('revocation_events')
      .insert({
        consent_id: consentId,
        revoked_by: user.id,
        reason,
        revoked_at: timestamp,
        revocation_hash: revocationHash
      })
      .select()
      .single();

    if (revocationError) {
      throw new Error(`Failed to create revocation event: ${revocationError.message}`);
    }

    // Queue the revocation hash for blockchain anchoring
    const { error: queueError } = await supabase
      .from('hash_anchor_queue')
      .insert({
        record_type: 'consent_revocation',
        hash: revocationHash,
        patient_id: user.id,
        metadata: {
          consent_id: consentId,
          revocation_event_id: revocationEvent.id,
          reason,
          timestamp,
          original_consent: {
            user_did: consent.user_did,
            requester: consent.requester,
            data_types: consent.data_types
          }
        }
      });

    if (queueError) {
      console.warn('Failed to queue revocation for anchoring:', queueError.message);
      // Continue execution - revocation should succeed even if anchoring fails
    }

    // Create audit log for the revocation action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'CONSENT_REVOKED',
        resource: 'consents',
        resource_id: consentId,
        status: 'success',
        details: `User revoked consent for ${consent.requester}. Reason: ${reason || 'No reason provided'}`,
        metadata: {
          revocation_hash: revocationHash,
          consent_id: consentId,
          revocation_event_id: revocationEvent.id,
          original_consent: {
            user_did: consent.user_did,
            requester: consent.requester,
            data_types: consent.data_types,
            duration: consent.duration
          }
        }
      });

    return {
      revocationId: revocationEvent.id,
      revocationHash
    };
  } catch (error) {
    console.error('Error revoking consent:', error);
    
    // Log failure to audit logs
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'CONSENT_REVOCATION_FAILED',
            resource: 'consents',
            resource_id: consentId,
            status: 'error',
            details: `Failed to revoke consent: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              reason
            }
          });
      }
    } catch (auditError) {
      console.error('Failed to log revocation failure:', auditError);
    }
    
    throw error;
  }
}

export async function getConsentRevocations(consentId?: string): Promise<RevocationEvent[]> {
  try {
    let query = supabase
      .from('revocation_events')
      .select('*')
      .order('revoked_at', { ascending: false });

    if (consentId) {
      query = query.eq('consent_id', consentId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch revocation events: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching consent revocations:', error);
    throw error;
  }
}