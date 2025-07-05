import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sha256 } from 'https://esm.sh/js-sha256@0.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record_id, patient_id, type, timestamp, hash } = await req.json();
    
    // Validate required fields
    if (!record_id || !patient_id || !type || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: record_id, patient_id, type, timestamp' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate or use provided hash for blockchain anchoring
    const anchorHash = hash || sha256(`${record_id}:${patient_id}:${type}:${timestamp}`);
    
    console.log('Creating anchor for record:', {
      record_id,
      patient_id,
      type,
      timestamp,
      hash: anchorHash
    });

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Insert anchor record into database
    const { data, error } = await supabase
      .from('record_anchors')
      .insert({
        record_id,
        anchor_hash: anchorHash,
        anchored_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: `Database error: ${error.message}` }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Anchor created successfully:', data);

    // TODO: Replace with actual blockchain anchoring
    // For now, we're just logging to database as a placeholder
    // Future implementation will include:
    // - Autheo blockchain integration
    // - Transaction hash storage
    // - Verification mechanisms

    return new Response(
      JSON.stringify({ 
        status: 'anchored', 
        hash: anchorHash,
        anchor_id: data.id,
        anchored_at: data.anchored_at,
        blockchain_placeholder: true
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Anchor function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});