
import { supabase } from '@/integrations/supabase/client';

interface AuditLogForHashing {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  timestamp: string;
  metadata: Record<string, any> | null;
}

interface AuditHashResult {
  hash: string;
  logCount: number;
  timestamp: string;
  logs: AuditLogForHashing[];
}

export class AuditHashService {
  /**
   * Fetch recent audit logs for hashing
   */
  static async fetchAuditLogsForHash(limit: number = 100): Promise<AuditLogForHashing[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, user_id, action, target_type, target_id, timestamp, metadata')
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    // Transform the data to match our interface, handling the Json type from Supabase
    return (data || []).map(log => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      target_type: log.target_type,
      target_id: log.target_id,
      timestamp: log.timestamp,
      metadata: log.metadata as Record<string, any> | null
    }));
  }

  /**
   * Compute SHA256 hash using Web Crypto API (browser-compatible)
   */
  static async computeAuditHash(auditLogs: AuditLogForHashing[]): Promise<string> {
    if (auditLogs.length === 0) {
      const encoder = new TextEncoder();
      const data = encoder.encode('empty');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    const encoder = new TextEncoder();
    let concatenatedData = '';
    
    for (const log of auditLogs) {
      const logString = [
        log.id,
        log.user_id || 'null',
        log.action,
        log.target_type || 'null',
        log.target_id || 'null',
        log.timestamp,
        JSON.stringify(log.metadata || {})
      ].join('|');
      
      concatenatedData += logString;
    }
    
    const data = encoder.encode(concatenatedData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate a complete audit hash result
   */
  static async generateAuditHashResult(limit: number = 100): Promise<AuditHashResult> {
    const logs = await this.fetchAuditLogsForHash(limit);
    const hash = await this.computeAuditHash(logs);
    
    return {
      hash,
      logCount: logs.length,
      timestamp: new Date().toISOString(),
      logs
    };
  }

  /**
   * Prepare hash for blockchain anchoring
   */
  static prepareForBlockchain(auditHashResult: AuditHashResult): {
    hash: string;
    metadata: Record<string, any>;
    dataPayload: string;
  } {
    const metadata = {
      timestamp: auditHashResult.timestamp,
      logCount: auditHashResult.logCount,
      hashAlgorithm: 'sha256',
      version: '1.0'
    };

    // Create a hex-encoded data payload for blockchain transaction
    const dataPayload = `0x${Buffer.from(auditHashResult.hash, 'utf8').toString('hex')}`;

    return {
      hash: auditHashResult.hash,
      metadata,
      dataPayload
    };
  }

  /**
   * Store hash anchor record in database
   */
  static async storeHashAnchor(
    hash: string,
    logCount: number,
    blockchainTxHash?: string,
    blockchainNetwork?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('audit_hash_anchors')
      .insert({
        hash,
        log_count: logCount,
        blockchain_tx_hash: blockchainTxHash,
        blockchain_network: blockchainNetwork,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing hash anchor:', error);
      throw new Error(`Failed to store hash anchor: ${error.message}`);
    }
  }
}
