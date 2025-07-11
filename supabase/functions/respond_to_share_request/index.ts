import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { request_id, decision, decision_note } = await req.json()

    // Validate input
    if (!request_id || !['approved', 'rejected'].includes(decision)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input. Decision must be "approved" or "rejected"' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First, verify the user owns this sharing permission request
    const { data: permission, error: fetchError } = await supabase
      .from('sharing_permissions')
      .select('patient_id, grantee_id, permission_type')
      .eq('id', request_id)
      .single()

    if (fetchError || !permission) {
      return new Response(
        JSON.stringify({ error: 'Sharing permission not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the user is the patient who can approve/reject this request
    if (permission.patient_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to respond to this request' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update the sharing permission
    const updateFields: any = {
      status: decision,
      responded_at: new Date().toISOString()
    }

    if (decision_note) {
      updateFields.decision_note = decision_note
    }

    const { data, error } = await supabase
      .from('sharing_permissions')
      .update(updateFields)
      .eq('id', request_id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update sharing permission' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the audit trail
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: `sharing_permission_${decision}`,
          resource: 'sharing_permissions',
          resource_id: request_id,
          details: `${decision.charAt(0).toUpperCase() + decision.slice(1)} sharing request for ${permission.permission_type} access`,
          metadata: {
            grantee_id: permission.grantee_id,
            permission_type: permission.permission_type,
            decision_note: decision_note || null
          }
        })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
      // Don't fail the main operation if audit logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: `Sharing request ${decision} successfully`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})