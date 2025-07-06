import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { record_id, operation, payload, patient_id, provider_id, signer_id } = await req.json();

    if (!record_id || !operation || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: record_id, operation, payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stringify and hash the payload
    const normalizedPayload = JSON.stringify(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedPayload));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('🔍 Generating hash for record:', { record_id, operation, hash: hashHex.substring(0, 16) + '...' });

    const { error } = await supabase.from('record_hashes').insert({
      record_id,
      patient_id,
      provider_id,
      signer_id,
      hash: hashHex,
      operation
    });

    if (error) {
      console.error('❌ Error storing record hash:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Record hash stored successfully');

    return new Response(
      JSON.stringify({ hash: hashHex }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Hash record error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});