
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
    console.log(`🔍 Fetching audit logs for hashing (limit: ${limit})`);
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, user_id, action, target_type, target_id, timestamp, metadata')
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching audit logs:', error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} audit logs`);
    if (data && data.length > 0) {
      console.log('📄 Sample audit log:', data[0]);
    }

    // Transform the data to match our interface, handling the Json type from Supabase
    const transformedLogs = (data || []).map(log => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      target_type: log.target_type,
      target_id: log.target_id,
      timestamp: log.timestamp,
      metadata: log.metadata as Record<string, any> | null
    }));

    console.log(`🔄 Transformed ${transformedLogs.length} logs for hashing`);
    return transformedLogs;
  }

  /**
   * Compute SHA256 hash using Web Crypto API (browser-compatible)
   */
  static async computeAuditHash(auditLogs: AuditLogForHashing[]): Promise<string> {
    console.log(`🔐 Computing hash for ${auditLogs.length} audit logs`);
    
    if (auditLogs.length === 0) {
      console.log('⚠️ No audit logs provided, computing hash for empty string');
      const encoder = new TextEncoder();
      const data = encoder.encode('empty');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      console.log(`✅ Empty hash computed: ${hash}`);
      return hash;
    }

    const encoder = new TextEncoder();
    let concatenatedData = '';
    
    console.log('🔗 Concatenating audit log data...');
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
    
    console.log(`📝 Concatenated data length: ${concatenatedData.length} characters`);
    console.log(`📝 Sample concatenated data (first 100 chars): ${concatenatedData.substring(0, 100)}...`);
    
    const data = encoder.encode(concatenatedData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log(`✅ Hash computed successfully: ${hash}`);
    return hash;
  }

  /**
   * Generate a complete audit hash result
   */
  static async generateAuditHashResult(limit: number = 100): Promise<AuditHashResult> {
    console.log('🚀 Starting audit hash generation process...');
    
    const logs = await this.fetchAuditLogsForHash(limit);
    const hash = await this.computeAuditHash(logs);
    const timestamp = new Date().toISOString();
    
    const result = {
      hash,
      logCount: logs.length,
      timestamp,
      logs
    };
    
    console.log('📊 Audit hash generation complete:');
    console.log(`   - Hash: ${hash}`);
    console.log(`   - Log Count: ${logs.length}`);
    console.log(`   - Timestamp: ${timestamp}`);
    
    return result;
  }

  /**
   * Prepare hash for blockchain anchoring
   */
  static prepareForBlockchain(auditHashResult: AuditHashResult): {
    hash: string;
    metadata: Record<string, any>;
    dataPayload: string;
  } {
    console.log('⛓️ Preparing audit hash for blockchain anchoring...');
    
    const metadata = {
      timestamp: auditHashResult.timestamp,
      logCount: auditHashResult.logCount,
      hashAlgorithm: 'sha256',
      version: '1.0'
    };

    // Create a hex-encoded data payload for blockchain transaction
    const dataPayload = `0x${Buffer.from(auditHashResult.hash, 'utf8').toString('hex')}`;

    const result = {
      hash: auditHashResult.hash,
      metadata,
      dataPayload
    };
    
    console.log('⛓️ Blockchain preparation complete:');
    console.log(`   - Hash: ${result.hash}`);
    console.log(`   - Data Payload: ${result.dataPayload}`);
    console.log(`   - Metadata:`, result.metadata);

    return result;
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
    console.log('💾 Storing hash anchor in database...');
    console.log(`   - Hash: ${hash}`);
    console.log(`   - Log Count: ${logCount}`);
    console.log(`   - Blockchain TX Hash: ${blockchainTxHash}`);
    console.log(`   - Blockchain Network: ${blockchainNetwork}`);
    
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
      console.error('❌ Error storing hash anchor:', error);
      throw new Error(`Failed to store hash anchor: ${error.message}`);
    }
    
    console.log('✅ Hash anchor stored successfully in database');
  }
}
