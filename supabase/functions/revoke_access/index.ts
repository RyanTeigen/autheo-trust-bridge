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
    const { medical_record_id, grantee_id } = await req.json();
    
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

    // Verify that the user owns the medical record
    const { data: record, error: recordError } = await supabase
      .from('medical_records')
      .select('user_id, patient_id')
      .eq('id', medical_record_id)
      .single()

    if (recordError) {
      return new Response(
        JSON.stringify({ error: 'Medical record not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user owns the record (either as user_id or patient_id)
    if (record.user_id !== user.id && record.patient_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied - you do not own this record' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the sharing permission status to revoked
    const { error: updateError } = await supabase
      .from('sharing_permissions')
      .update({ 
        status: 'revoked',
        responded_at: new Date().toISOString()
      })
      .eq('medical_record_id', medical_record_id)
      .eq('grantee_id', grantee_id)
      .eq('status', 'approved') // Only revoke currently approved permissions

    if (updateError) {
      console.error('Error updating sharing permission:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to revoke access' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the revocation action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'REVOKE_RECORD_ACCESS',
      resource: 'sharing_permissions',
      status: 'success',
      details: `Revoked access to medical record ${medical_record_id} from user ${grantee_id}`,
      metadata: {
        medical_record_id,
        grantee_id,
        action_type: 'revoke_access'
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Access revoked successfully' 
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