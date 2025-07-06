import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      record_id, 
      patient_id, 
      provider_id, 
      operation, 
      signer_id,
      record_data 
    } = await req.json();
    
    if (!record_id || !operation || !record_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: record_id, operation, record_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create standardized payload for hashing
    const hashPayload = {
      record_id,
      patient_id,
      provider_id,
      operation,
      timestamp: new Date().toISOString(),
      record_data: typeof record_data === 'string' ? record_data : JSON.stringify(record_data)
    };

    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(hashPayload));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('🔍 Generating hash for record:', { record_id, operation, hash: hash.substring(0, 16) + '...' });

    // Store hash in record_hashes table
    const { data: recordHash, error } = await supabase
      .from('record_hashes')
      .insert({
        record_id,
        patient_id,
        provider_id,
        hash,
        operation,
        signer_id,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error storing record hash:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Record hash stored:', recordHash.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        hash,
        record_hash_id: recordHash.id,
        message: 'Record hash generated and stored successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Hash record error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});