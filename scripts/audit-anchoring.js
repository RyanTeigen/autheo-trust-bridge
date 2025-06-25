
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK || 'autheo-testnet';
const LOG_LIMIT = parseInt(process.env.LOG_LIMIT || '100');
const FORCE_ANCHOR = process.env.FORCE_ANCHOR === 'true';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

class AuditAnchoringService {
  static async fetchAuditLogsForHash(limit = 100) {
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
    return data || [];
  }

  static async computeAuditHash(auditLogs) {
    console.log(`🔐 Computing hash for ${auditLogs.length} audit logs`);
    
    if (auditLogs.length === 0) {
      console.log('⚠️ No audit logs provided, computing hash for empty string');
      return crypto.createHash('sha256').update('empty').digest('hex');
    }

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
    
    const hash = crypto.createHash('sha256').update(concatenatedData).digest('hex');
    console.log(`✅ Hash computed successfully: ${hash}`);
    return hash;
  }

  static async checkRecentAnchors() {
    console.log('🔍 Checking for recent anchors...');
    
    const { data, error } = await supabase
      .from('audit_anchors')
      .select('anchored_at')
      .order('anchored_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error checking recent anchors:', error);
      return null;
    }

    return data?.[0] || null;
  }

  static async storeAnchor(hash, logCount, blockchainTxHash) {
    console.log('💾 Storing anchor in database...');
    
    const { error: hashError } = await supabase
      .from('audit_hash_anchors')
      .insert({
        hash,
        log_count: logCount,
        blockchain_tx_hash: blockchainTxHash,
        blockchain_network: BLOCKCHAIN_NETWORK,
        created_at: new Date().toISOString()
      });

    if (hashError) {
      console.error('❌ Error storing hash anchor:', hashError);
      throw new Error(`Failed to store hash anchor: ${hashError.message}`);
    }

    const { error: anchorError } = await supabase
      .from('audit_anchors')
      .insert({
        tx_hash: blockchainTxHash,
        audit_hash: hash,
        log_count: logCount,
        anchored_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (anchorError) {
      console.error('❌ Error storing blockchain anchor:', anchorError);
      throw new Error(`Failed to store blockchain anchor: ${anchorError.message}`);
    }
    
    console.log('✅ Anchors stored successfully in database');
  }

  static generateMockTxHash() {
    return `0x${crypto.randomBytes(32).toString('hex')}`;
  }
}

async function main() {
  console.log('🚀 Starting automated audit log anchoring process...');
  console.log(`📊 Configuration:`);
  console.log(`   - Blockchain Network: ${BLOCKCHAIN_NETWORK}`);
  console.log(`   - Log Limit: ${LOG_LIMIT}`);
  console.log(`   - Force Anchor: ${FORCE_ANCHOR}`);

  const report = {
    timestamp: new Date().toISOString(),
    success: false,
    error: null,
    stats: {
      logsProcessed: 0,
      hashGenerated: null,
      txHash: null,
      processingTimeMs: 0
    }
  };

  const startTime = Date.now();

  try {
    // Check if we should skip anchoring
    if (!FORCE_ANCHOR) {
      const recentAnchor = await AuditAnchoringService.checkRecentAnchors();
      if (recentAnchor) {
        const hoursSinceLastAnchor = (Date.now() - new Date(recentAnchor.anchored_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastAnchor < 6) {
          console.log(`⏰ Recent anchor found (${hoursSinceLastAnchor.toFixed(1)}h ago), skipping...`);
          report.success = true;
          report.stats.processingTimeMs = Date.now() - startTime;
          return;
        }
      }
    }

    // Fetch audit logs
    const logs = await AuditAnchoringService.fetchAuditLogsForHash(LOG_LIMIT);
    report.stats.logsProcessed = logs.length;

    if (logs.length === 0 && !FORCE_ANCHOR) {
      console.log('⚠️ No audit logs found, skipping anchoring');
      report.success = true;
      report.stats.processingTimeMs = Date.now() - startTime;
      return;
    }

    // Generate hash
    const hash = await AuditAnchoringService.computeAuditHash(logs);
    report.stats.hashGenerated = hash;

    // Simulate blockchain transaction
    const mockTxHash = AuditAnchoringService.generateMockTxHash();
    report.stats.txHash = mockTxHash;
    
    console.log(`⛓️ Simulating blockchain transaction: ${mockTxHash}`);

    // Store anchors
    await AuditAnchoringService.storeAnchor(hash, logs.length, mockTxHash);

    report.success = true;
    report.stats.processingTimeMs = Date.now() - startTime;

    console.log('🎉 Audit log anchoring completed successfully!');
    console.log(`📊 Final Report:`);
    console.log(`   - Logs Processed: ${report.stats.logsProcessed}`);
    console.log(`   - Hash: ${report.stats.hashGenerated}`);
    console.log(`   - TX Hash: ${report.stats.txHash}`);
    console.log(`   - Processing Time: ${report.stats.processingTimeMs}ms`);

  } catch (error) {
    console.error('❌ Audit log anchoring failed:', error);
    report.error = error.message;
    report.stats.processingTimeMs = Date.now() - startTime;
    process.exit(1);
  } finally {
    // Write report to file
    fs.writeFileSync('audit-anchoring-report.json', JSON.stringify(report, null, 2));
  }
}

// Run the main function
main().catch(console.error);
