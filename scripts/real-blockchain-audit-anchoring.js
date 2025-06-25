
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK || 'autheo-testnet';
const BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const LOG_LIMIT = parseInt(process.env.LOG_LIMIT || '100');
const FORCE_ANCHOR = process.env.FORCE_ANCHOR === 'true';
const USE_MAINNET = process.env.USE_MAINNET === 'true';

// Blockchain configuration
const AUTHEO_TESTNET_RPC = 'https://rpc-testnet.autheo.io';
const AUTHEO_MAINNET_RPC = 'https://rpc.autheo.io';
const CONTRACT_ADDRESS = USE_MAINNET 
  ? '0x742d35Cc8Ba6458b4b9395Fa3a44b4b8D4E6F8Cf' // Mainnet
  : '0x123d35Cc8Ba6458b4b9395Fa3a44b4b8D4E6F8Cf'; // Testnet

// Smart contract ABI
const AUDIT_ANCHOR_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "auditHash", "type": "string"},
      {"internalType": "uint256", "name": "logCount", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "anchorAuditHash",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "payable",
    "type": "function"
  }
];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

if (!BLOCKCHAIN_PRIVATE_KEY) {
  console.error('❌ Missing BLOCKCHAIN_PRIVATE_KEY environment variable');
  console.error('   This is required for real blockchain anchoring');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const web3 = new Web3(new Web3.providers.HttpProvider(USE_MAINNET ? AUTHEO_MAINNET_RPC : AUTHEO_TESTNET_RPC));

class RealBlockchainAuditAnchoringService {
  static async initializeBlockchain() {
    console.log('🔗 Initializing blockchain connection...');
    
    try {
      const account = web3.eth.accounts.privateKeyToAccount(BLOCKCHAIN_PRIVATE_KEY);
      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;
      
      const balance = await web3.eth.getBalance(account.address);
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      
      console.log(`✅ Blockchain initialized`);
      console.log(`   - Network: ${USE_MAINNET ? 'Autheo Mainnet' : 'Autheo Testnet'}`);
      console.log(`   - Account: ${account.address}`);
      console.log(`   - Balance: ${balanceEth} ETH`);
      
      if (parseFloat(balanceEth) < 0.001) {
        throw new Error('Insufficient balance for blockchain transactions');
      }
      
      return account.address;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error);
      throw error;
    }
  }

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

  static async anchorOnBlockchain(auditHash, logCount) {
    console.log('⛓️ Anchoring hash on Autheo blockchain...');
    console.log(`   - Hash: ${auditHash}`);
    console.log(`   - Log Count: ${logCount}`);
    
    try {
      const contract = new web3.eth.Contract(AUDIT_ANCHOR_ABI, CONTRACT_ADDRESS);
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Estimate gas
      const gasEstimate = await contract.methods
        .anchorAuditHash(auditHash, logCount, timestamp)
        .estimateGas({ from: web3.eth.defaultAccount });
      
      console.log(`⛽ Estimated gas: ${gasEstimate}`);
      
      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();
      console.log(`💰 Gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`);
      
      // Send transaction
      const transaction = await contract.methods
        .anchorAuditHash(auditHash, logCount, timestamp)
        .send({
          from: web3.eth.defaultAccount,
          gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
          gasPrice: gasPrice
        });
      
      console.log('✅ Blockchain transaction successful!');
      console.log(`   - Transaction Hash: ${transaction.transactionHash}`);
      console.log(`   - Block Number: ${transaction.blockNumber}`);
      console.log(`   - Gas Used: ${transaction.gasUsed}`);
      
      return {
        transactionHash: transaction.transactionHash,
        blockNumber: transaction.blockNumber,
        gasUsed: transaction.gasUsed,
        timestamp
      };
      
    } catch (error) {
      console.error('❌ Blockchain anchoring failed:', error);
      throw error;
    }
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

  static async storeAnchor(hash, logCount, blockchainResult) {
    console.log('💾 Storing anchor in database...');
    
    const networkName = USE_MAINNET ? 'autheo-mainnet' : 'autheo-testnet';
    
    const { error: hashError } = await supabase
      .from('audit_hash_anchors')
      .insert({
        hash,
        log_count: logCount,
        blockchain_tx_hash: blockchainResult.transactionHash,
        blockchain_network: networkName,
        created_at: new Date().toISOString()
      });

    if (hashError) {
      console.error('❌ Error storing hash anchor:', hashError);
      throw new Error(`Failed to store hash anchor: ${hashError.message}`);
    }

    const { error: anchorError } = await supabase
      .from('audit_anchors')
      .insert({
        tx_hash: blockchainResult.transactionHash,
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

  static getExplorerUrl(transactionHash) {
    const baseUrl = USE_MAINNET 
      ? 'https://explorer.autheo.io'
      : 'https://testnet-explorer.autheo.io';
    
    return `${baseUrl}/tx/${transactionHash}`;
  }
}

async function main() {
  console.log('🚀 Starting REAL blockchain audit log anchoring process...');
  console.log(`📊 Configuration:`);
  console.log(`   - Blockchain Network: ${BLOCKCHAIN_NETWORK}`);
  console.log(`   - Use Mainnet: ${USE_MAINNET}`);
  console.log(`   - Log Limit: ${LOG_LIMIT}`);
  console.log(`   - Force Anchor: ${FORCE_ANCHOR}`);

  const report = {
    timestamp: new Date().toISOString(),
    success: false,
    error: null,
    stats: {
      logsProcessed: 0,
      hashGenerated: null,
      blockchainTxHash: null,
      blockNumber: null,
      gasUsed: null,
      explorerUrl: null,
      processingTimeMs: 0
    }
  };

  const startTime = Date.now();

  try {
    // Initialize blockchain connection
    await RealBlockchainAuditAnchoringService.initializeBlockchain();
    
    // Check if we should skip anchoring
    if (!FORCE_ANCHOR) {
      const recentAnchor = await RealBlockchainAuditAnchoringService.checkRecentAnchors();
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
    const logs = await RealBlockchainAuditAnchoringService.fetchAuditLogsForHash(LOG_LIMIT);
    report.stats.logsProcessed = logs.length;

    if (logs.length === 0 && !FORCE_ANCHOR) {
      console.log('⚠️ No audit logs found, skipping anchoring');
      report.success = true;
      report.stats.processingTimeMs = Date.now() - startTime;
      return;
    }

    // Generate hash
    const hash = await RealBlockchainAuditAnchoringService.computeAuditHash(logs);
    report.stats.hashGenerated = hash;

    // Anchor on real blockchain
    const blockchainResult = await RealBlockchainAuditAnchoringService.anchorOnBlockchain(hash, logs.length);
    report.stats.blockchainTxHash = blockchainResult.transactionHash;
    report.stats.blockNumber = blockchainResult.blockNumber;
    report.stats.gasUsed = blockchainResult.gasUsed;
    report.stats.explorerUrl = RealBlockchainAuditAnchoringService.getExplorerUrl(blockchainResult.transactionHash);

    // Store anchors
    await RealBlockchainAuditAnchoringService.storeAnchor(hash, logs.length, blockchainResult);

    report.success = true;
    report.stats.processingTimeMs = Date.now() - startTime;

    console.log('🎉 Real blockchain audit log anchoring completed successfully!');
    console.log(`📊 Final Report:`);
    console.log(`   - Logs Processed: ${report.stats.logsProcessed}`);
    console.log(`   - Hash: ${report.stats.hashGenerated}`);
    console.log(`   - TX Hash: ${report.stats.blockchainTxHash}`);
    console.log(`   - Block Number: ${report.stats.blockNumber}`);
    console.log(`   - Gas Used: ${report.stats.gasUsed}`);
    console.log(`   - Explorer URL: ${report.stats.explorerUrl}`);
    console.log(`   - Processing Time: ${report.stats.processingTimeMs}ms`);

  } catch (error) {
    console.error('❌ Real blockchain audit log anchoring failed:', error);
    report.error = error.message;
    report.stats.processingTimeMs = Date.now() - startTime;
    process.exit(1);
  } finally {
    // Write report to file
    fs.writeFileSync('real-blockchain-anchoring-report.json', JSON.stringify(report, null, 2));
  }
}

// Run the main function
main().catch(console.error);
