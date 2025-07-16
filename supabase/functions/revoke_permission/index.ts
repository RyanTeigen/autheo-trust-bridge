import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RevokeRequest {
  permission_id: string
  patient_id: string
  reason?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { permission_id, patient_id, reason }: RevokeRequest = await req.json()

    if (!permission_id || !patient_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: permission_id and patient_id' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // First verify the permission belongs to the patient
    const { data: permission, error: fetchError } = await supabase
      .from('sharing_permissions')
      .select('*')
      .eq('id', permission_id)
      .eq('patient_id', patient_id)
      .single()

    if (fetchError || !permission) {
      console.error('Permission fetch error:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Permission not found or access denied' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update the permission to revoked status
    const { error: updateError } = await supabase
      .from('sharing_permissions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_reason: reason || 'Revoked by patient',
        updated_at: new Date().toISOString()
      })
      .eq('id', permission_id)
      .eq('patient_id', patient_id)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: `Failed to revoke permission: ${updateError.message}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the revocation in audit logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: patient_id,
        action: 'REVOKE_SHARING_PERMISSION',
        resource: 'sharing_permissions',
        resource_id: permission_id,
        status: 'success',
        details: `Patient revoked sharing permission for medical record. Reason: ${reason || 'No reason provided'}`,
        timestamp: new Date().toISOString()
      })

    console.log(`Permission ${permission_id} revoked successfully by patient ${patient_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Permission revoked successfully' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Revoke permission error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})