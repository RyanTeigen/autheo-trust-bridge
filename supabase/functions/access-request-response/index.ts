
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  console.log('Access request response function - Request received:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Access request response function - Auth header present:', !!authHeader)
    
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
    
    console.log('Access request response function - User authenticated:', !!user)
    console.log('Access request response function - Auth error:', authError)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: authError?.message }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.json()
    console.log('Access request response function - Request body:', body)
    
    const { requestId, action, reason } = body
    
    // Validate required fields
    if (!requestId || !action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Request ID and action are required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Action must be either "approve" or "reject"' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the current patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (patientError || !patient) {
      console.error('Patient lookup error:', patientError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Patient record not found' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the sharing permission exists and belongs to the current patient
    const { data: permission, error: permissionError } = await supabase
      .from('sharing_permissions')
      .select('*')
      .eq('id', requestId)
      .eq('patient_id', patient.id)
      .eq('status', 'pending')
      .single()

    if (permissionError || !permission) {
      console.error('Permission lookup error:', permissionError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Access request not found or already processed' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update the sharing permission status
    const status = action === 'approve' ? 'approved' : 'rejected'
    const { data: updatedPermission, error: updateError } = await supabase
      .from('sharing_permissions')
      .update({
        status: status,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to update access request',
          details: updateError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // TODO: In a real system, send notification to the provider about the response

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Access request ${action}d successfully`,
        data: {
          id: updatedPermission.id,
          status: updatedPermission.status,
          responded_at: updatedPermission.responded_at
        }
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
        success: false, 
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
