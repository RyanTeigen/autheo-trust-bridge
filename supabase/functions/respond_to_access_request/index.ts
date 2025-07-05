import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { medical_record_id, grantee_id, decision, note } = await req.json();
    
    if (!['approved', 'rejected'].includes(decision)) {
      return new Response(
        JSON.stringify({ error: 'Invalid decision. Must be "approved" or "rejected"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the sharing permission status
    const { error: updateError } = await supabase
      .from('sharing_permissions')
      .update({ 
        status: decision,
        decision_note: note || null,
        responded_at: new Date().toISOString()
      })
      .eq('medical_record_id', medical_record_id)
      .eq('grantee_id', grantee_id)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Error updating sharing permission:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update permission' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the decision
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `ACCESS_REQUEST_${decision.toUpperCase()}`,
      resource: 'sharing_permissions',
      status: 'success',
      details: `${decision} access request for medical record ${medical_record_id} from user ${grantee_id}`,
      metadata: {
        medical_record_id,
        grantee_id,
        decision,
        note: note || null
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Access request ${decision} successfully` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})