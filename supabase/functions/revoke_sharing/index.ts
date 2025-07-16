import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record_id, reason } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }), 
        { status: 401, headers: corsHeaders }
      )
    }

    if (!record_id) {
      return new Response(
        JSON.stringify({ error: 'Missing record_id' }), 
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: corsHeaders }
      )
    }

    console.log('Revoking access for user:', user.id, 'record:', record_id)

    // Update the sharing permission status to revoked
    const { error: updateError } = await supabase
      .from('sharing_permissions')
      .update({
        status: 'revoked',
        revoked_reason: reason || null,
        revoked_at: new Date().toISOString(),
      })
      .eq('medical_record_id', record_id)
      .eq('patient_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: updateError.message }), 
        { status: 500, headers: corsHeaders }
      )
    }

    // Log the audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'revoke_access',
      details: `Patient revoked provider access to record ${record_id}`,
      metadata: { record_id, reason },
    })

    console.log('Successfully revoked sharing permission for record:', record_id)

    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error in revoke_sharing function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: corsHeaders }
    )
  }
})