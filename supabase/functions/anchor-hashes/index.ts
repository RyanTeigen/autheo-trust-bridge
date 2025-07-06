import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

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

// Simulate blockchain anchoring (replace with real blockchain call later)
async function simulateBlockchainAnchoring(hash: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Generate mock transaction hash
  const timestamp = Date.now().toString();
  const hashPrefix = hash.substring(0, 8);
  const mockTxHash = `0x${hashPrefix}${timestamp.substring(-8)}blockchain`;
  
  // Simulate occasional failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Blockchain network temporarily unavailable');
  }
  
  return mockTxHash;
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
        
        // Simulate blockchain anchoring
        const blockchainTxHash = await simulateBlockchainAnchoring(item.hash);
        
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
        results.anchored++;

      } catch (error) {
        console.error(`❌ Failed to anchor hash ${item.id}:`, error);
        
        // Update queue item as failed
        const { error: updateError } = await supabase
          .from('hash_anchor_queue')
          .update({
            anchor_status: item.retry_count >= 2 ? 'failed' : 'pending',
            retry_count: item.retry_count + 1,
            error_message: error.message
          })
          .eq('id', item.id);

        if (updateError) {
          console.error('Failed to update error status:', updateError);
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