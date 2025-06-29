
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authenticated user
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Authenticated user:', user.id)

    // Parse request body
    const { requestId } = await req.json()
    
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Missing requestId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Revoking access request:', requestId)

    // Get the sharing permission to verify ownership
    const { data: permission, error: fetchError } = await supabase
      .from('sharing_permissions')
      .select('id, patient_id, grantee_id')
      .eq('id', requestId)
      .single()

    if (fetchError) {
      console.error('Error fetching permission:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Permission not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the user owns this permission
    if (permission.patient_id !== user.id) {
      console.error('Access denied - user does not own this permission')
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const now = new Date().toISOString()

    // Update the sharing permission status to revoked
    const { error: updateError } = await supabase
      .from('sharing_permissions')
      .update({ 
        status: 'revoked', 
        updated_at: now, 
        responded_at: now 
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating permission:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to revoke access' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the action for audit purposes
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'REVOKE_ACCESS_REQUEST',
        resource: 'sharing_permissions',
        resource_id: requestId,
        status: 'success',
        details: `Revoked access request for provider ${permission.grantee_id}`,
        timestamp: now
      })

    if (auditError) {
      console.error('Audit log error:', auditError)
      // Don't fail the request if audit logging fails
    }

    console.log('Successfully revoked access request:', requestId)

    return new Response(
      JSON.stringify({ success: true }),
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
