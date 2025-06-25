
import { createHash } from 'crypto';
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

    return data || [];
  }

  /**
   * Compute SHA256 hash of concatenated audit log entries
   */
  static computeAuditHash(auditLogs: AuditLogForHashing[]): string {
    if (auditLogs.length === 0) {
      return createHash('sha256').update('empty').digest('hex');
    }

    const hash = createHash('sha256');
    
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
      
      hash.update(logString);
    }
    
    return hash.digest('hex');
  }

  /**
   * Generate a complete audit hash result
   */
  static async generateAuditHashResult(limit: number = 100): Promise<AuditHashResult> {
    const logs = await this.fetchAuditLogsForHash(limit);
    const hash = this.computeAuditHash(logs);
    
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
