
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
    try {
      // Try API endpoint first (for authenticated users with proper roles)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const response = await fetch('/api/audit/anchors', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          return result.data || [];
        }
        
        // If API fails, fall back to direct Supabase query
        console.warn('API endpoint failed, falling back to direct query');
      }

      // Fallback to direct Supabase query
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
    } catch (error) {
      console.error('Error in fetchBlockchainAnchors:', error);
      throw error;
    }
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
