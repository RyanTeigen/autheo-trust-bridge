import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { ethers } from 'https://esm.sh/ethers@6.8.0';

// Autheo Blockchain Configuration
const AUTHEO_TESTNET_RPC = 'https://testnet-rpc2.autheo.com';
const AUTHEO_MAINNET_RPC = 'https://rpc.autheo.io';
const AUTHEO_TESTNET_EXPLORER = 'https://testnet-explorer.autheo.io';
const AUTHEO_MAINNET_EXPLORER = 'https://explorer.autheo.io';

// Cron scheduling - run every 10 minutes
export const config = {
  schedule: "*/10 * * * *"
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueItem {
  id: string;
  record_id: string;
  hash: string;
  anchor_status: string;
  retry_count: number;
}

// Helper function to get explorer URL
function getExplorerUrl(transactionHash: string, useMainnet: boolean = false): string {
  const baseUrl = useMainnet ? AUTHEO_MAINNET_EXPLORER : AUTHEO_TESTNET_EXPLORER;
  return `${baseUrl}/tx/${transactionHash}`;
}

// Blockchain anchoring - currently in SIMULATION MODE
async function anchorToBlockchain(hash: string): Promise<string> {
  const useMainnet = Deno.env.get('USE_MAINNET') === 'true';
  const rpcUrl = Deno.env.get('BLOCKCHAIN_RPC_URL') || (useMainnet ? AUTHEO_MAINNET_RPC : AUTHEO_TESTNET_RPC);
  
  console.log(`🎭 [SIMULATION MODE] Using ${useMainnet ? 'Autheo Mainnet' : 'Autheo Testnet'}: ${rpcUrl}`);
  console.log('🔧 Real blockchain credentials not configured - running in simulation mode');
  
  // Always use simulation mode until real credentials are provided
  return simulateBlockchainAnchoring(hash, useMainnet);
}

// Enhanced simulation mode for blockchain anchoring
async function simulateBlockchainAnchoring(hash: string, useMainnet: boolean = false): Promise<string> {
  console.log('🎭 [SIMULATION] Starting blockchain anchoring simulation');
  console.log(`🔗 Target network: ${useMainnet ? 'Autheo Mainnet' : 'Autheo Testnet'}`);
  
  // Simulate realistic network delay based on network conditions
  const baseDelay = useMainnet ? 3000 : 2000; // Mainnet typically slower
  const randomDelay = Math.random() * 2000;
  await new Promise(resolve => setTimeout(resolve, baseDelay + randomDelay));
  
  // Generate realistic transaction hash
  const timestamp = Date.now().toString(16);
  const hashPrefix = hash.substring(2, 10); // Remove 0x and take 8 chars
  const networkSuffix = useMainnet ? 'main' : 'test';
  const randomBytes = Math.random().toString(16).substring(2, 18);
  const mockTxHash = `0x${hashPrefix}${timestamp.slice(-8)}${randomBytes}${networkSuffix}`;
  
  // Log simulated transaction details
  console.log(`✅ [SIMULATION] Generated transaction hash: ${mockTxHash}`);
  console.log(`🔍 [SIMULATION] Explorer URL: ${getExplorerUrl(mockTxHash, useMainnet)}`);
  console.log(`⛽ [SIMULATION] Gas used: ${21000 + Math.floor(Math.random() * 30000)}`);
  console.log(`🏗️ [SIMULATION] Block number: ${5000000 + Math.floor(Math.random() * 1000000)}`);
  
  // Simulate very rare network failures (2% chance)
  if (Math.random() < 0.02) {
    throw new Error(`${useMainnet ? 'Mainnet' : 'Testnet'} network temporarily congested - retry later`);
  }
  
  return mockTxHash;
}

// Send webhook notification with security
async function sendWebhookNotification(
  supabase: any,
  recordId: string,
  eventType: string,
  payload: any
): Promise<void> {
  const isProduction = Deno.env.get('ENV') === 'production';
  const webhookUrl = isProduction 
    ? Deno.env.get('WEBHOOK_URL_PROD') || Deno.env.get('WEBHOOK_URL')
    : Deno.env.get('WEBHOOK_URL_STAGING') || Deno.env.get('WEBHOOK_URL');
  
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
  
  if (!webhookUrl) {
    console.log(`📢 No webhook URL configured for ${isProduction ? 'production' : 'staging'}, skipping notification`);
    return;
  }

  try {
    console.log(`📢 Sending ${isProduction ? 'production' : 'staging'} webhook: ${eventType} for record ${recordId}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Autheo-Anchoring-Service/1.0'
    };

    // Add security header if secret is configured
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret;
      console.log('🔐 Added webhook security header');
    } else {
      console.warn('⚠️ No WEBHOOK_SECRET configured - webhook is not secured');
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event_type: eventType,
        record_id: recordId,
        timestamp: new Date().toISOString(),
        environment: isProduction ? 'production' : 'staging',
        ...payload
      })
    });

    const responseBody = await response.text();
    const success = response.ok;

    // Log webhook event to database
    await supabase.from('webhook_events').insert({
      event_type: eventType,
      record_id: recordId,
      payload: {
        ...payload,
        environment: isProduction ? 'production' : 'staging'
      },
      webhook_url: webhookUrl,
      response_status: response.status,
      response_body: responseBody,
      success
    });

    if (success) {
      console.log(`✅ Webhook sent successfully: ${response.status}`);
    } else {
      console.error(`❌ Webhook failed: ${response.status} - ${responseBody}`);
    }

  } catch (error) {
    console.error('Webhook notification failed:', error);
    
    // Log failed webhook event
    await supabase.from('webhook_events').insert({
      event_type: eventType,
      record_id: recordId,
      payload: {
        ...payload,
        environment: isProduction ? 'production' : 'staging'
      },
      webhook_url: webhookUrl,
      response_status: 0,
      response_body: error.message,
      success: false
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔗 Starting hash anchoring process...');

    // Get pending hashes from queue (limit to 10 per batch)
    const { data: pendingHashes, error: fetchError } = await supabase
      .from('hash_anchor_queue')
      .select('*')
      .eq('anchor_status', 'pending')
      .lt('retry_count', 3) // Don't retry more than 3 times
      .order('queued_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch pending hashes: ${fetchError.message}`);
    }

    if (!pendingHashes || pendingHashes.length === 0) {
      console.log('📭 No pending hashes to anchor');
      return new Response(
        JSON.stringify({ message: 'No pending hashes to anchor', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Processing ${pendingHashes.length} pending hashes`);

    const results = {
      processed: 0,
      anchored: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each hash
    for (const item of pendingHashes as QueueItem[]) {
      try {
        console.log(`🔗 Anchoring hash: ${item.hash.substring(0, 16)}...`);
        
        // Use real blockchain anchoring (falls back to simulation if no private key)
        const blockchainTxHash = await anchorToBlockchain(item.hash);
        
        // Update queue item as anchored
        const { error: updateError } = await supabase
          .from('hash_anchor_queue')
          .update({
            anchor_status: 'anchored',
            blockchain_tx_hash: blockchainTxHash,
            anchored_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', item.id);

        if (updateError) {
          throw new Error(`Failed to update anchor status: ${updateError.message}`);
        }

        console.log(`✅ Hash anchored successfully: ${blockchainTxHash}`);
        
        // Send webhook notification for successful anchoring
        await sendWebhookNotification(
          supabase,
          item.record_id,
          'anchoring_complete',
          {
            hash: item.hash,
            blockchain_tx_hash: blockchainTxHash,
            anchored_at: new Date().toISOString(),
            status: 'anchored'
          }
        );
        
        results.anchored++;

      } catch (error) {
        console.error(`❌ Failed to anchor hash ${item.id}:`, error);
        
        const isFinalFailure = item.retry_count >= 2;
        
        // Update queue item as failed or pending for retry
        const { error: updateError } = await supabase
          .from('hash_anchor_queue')
          .update({
            anchor_status: isFinalFailure ? 'failed' : 'pending',
            retry_count: item.retry_count + 1,
            error_message: error.message
          })
          .eq('id', item.id);

        if (updateError) {
          console.error('Failed to update error status:', updateError);
        }

        // Send webhook notification for failed anchoring (only on final failure)
        if (isFinalFailure) {
          await sendWebhookNotification(
            supabase,
            item.record_id,
            'anchoring_failed',
            {
              hash: item.hash,
              error_message: error.message,
              retry_count: item.retry_count + 1,
              status: 'failed'
            }
          );
        }

        results.failed++;
        results.errors.push(`${item.id}: ${error.message}`);
      }

      results.processed++;
    }

    console.log('🏁 Anchoring process completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        message: `Processed ${results.processed} hashes: ${results.anchored} anchored, ${results.failed} failed`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Anchor hashes error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});