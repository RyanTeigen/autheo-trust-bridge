
import { supabase } from '@/integrations/supabase/client';

interface BlockchainAnchor {
  id: string;
  tx_hash: string;
  anchored_at: string;
  audit_hash: string | null;
  log_count: number | null;
  created_at: string;
}

export class BlockchainAnchorService {
  /**
   * Fetch blockchain anchors from the audit_anchors table
   */
  static async fetchBlockchainAnchors(limit: number = 20): Promise<BlockchainAnchor[]> {
    const { data, error } = await supabase
      .from('audit_anchors')
      .select('*')
      .order('anchored_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching blockchain anchors:', error);
      throw new Error(`Failed to fetch blockchain anchors: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Store a new blockchain anchor record
   */
  static async storeBlockchainAnchor(
    txHash: string,
    auditHash?: string,
    logCount?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('audit_anchors')
      .insert({
        tx_hash: txHash,
        audit_hash: auditHash,
        log_count: logCount,
        anchored_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing blockchain anchor:', error);
      throw new Error(`Failed to store blockchain anchor: ${error.message}`);
    }
  }
}
