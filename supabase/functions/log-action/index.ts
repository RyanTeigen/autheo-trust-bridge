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
    const { actor_id, action, target_type, target_id, metadata, ip_address, user_agent } = await req.json();
    
    if (!actor_id || !action || !target_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: actor_id, action, target_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create payload for hashing
    const payload = {
      actor_id,
      action,
      target_type,
      target_id,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    // Generate SHA-256 hash for blockchain anchoring
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('🔍 Logging audit action:', { action, target_type, target_id, actor_id });

    // Insert audit log using existing table structure
    const { data: auditLog, error } = await supabase.from('audit_logs').insert({
      user_id: actor_id,
      action,
      resource: target_type,
      resource_id: target_id,
      status: 'success',
      details: `Action: ${action} on ${target_type}`,
      metadata: {
        ...metadata,
        hash,
        anchored: false
      },
      ip_address: ip_address || req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: user_agent || req.headers.get('user-agent') || 'unknown',
      target_type,
      target_id,
      timestamp: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('❌ Error inserting audit log:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Audit log created:', auditLog.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        hash,
        audit_log_id: auditLog.id,
        message: 'Action logged successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Log action error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});