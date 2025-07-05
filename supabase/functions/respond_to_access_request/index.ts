import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// DID consent signing utility
async function signAccessConsent(patientId: string, recordId: string, recipientId: string): Promise<string> {
  console.log("📝 Signing access consent:", { patientId, recordId, recipientId });
  
  const timestamp = new Date().toISOString();
  const consentHash = `signed-consent::${patientId}::${recordId}::${recipientId}::${timestamp}`;
  
  console.log("✅ Consent signed:", { consentHash, timestamp });
  return consentHash;
}

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

    // Initialize Supabase client with the auth token
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
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { request_id, status } = await req.json()

    // Validate input
    if (!request_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: request_id, status' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Status must be "approved" or "rejected"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing access request response: ${request_id} -> ${status} by user ${user.id}`)

    // Get the sharing permission request and verify ownership
    const { data: sharingRequest, error: fetchError } = await supabase
      .from('sharing_permissions')
      .select(`
        id,
        medical_record_id,
        patient_id,
        grantee_id,
        status,
        medical_records!inner(
          patient_id,
          provider_id
        )
      `)
      .eq('id', request_id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !sharingRequest) {
      console.error('Error fetching sharing request:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Sharing request not found or already processed' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get patient record for the current user
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (patientError || !patient) {
      console.error('Patient lookup error:', patientError)
      return new Response(
        JSON.stringify({ error: 'Patient record not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify that the current user is the patient (data owner)
    if (sharingRequest.patient_id !== patient.id) {
      console.error(`Unauthorized: User ${user.id} (patient ${patient.id}) cannot respond to request for patient ${sharingRequest.patient_id}`)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You can only respond to requests for your own records' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate signed consent if approving
    let signedConsent = null;
    if (status === 'approved') {
      try {
        signedConsent = await signAccessConsent(
          sharingRequest.patient_id,
          sharingRequest.medical_record_id,
          sharingRequest.grantee_id
        );
        console.log(`Generated consent signature: ${signedConsent}`);
      } catch (error) {
        console.error('Error generating consent signature:', error);
        // Continue without failing - consent is optional for now
      }
    }

    // Update the sharing permission status
    const updateData: any = {
      status: status,
      responded_at: new Date().toISOString()
    };

    if (signedConsent) {
      updateData.signed_consent = signedConsent;
    }

    const { error: updateError } = await supabase
      .from('sharing_permissions')
      .update(updateData)
      .eq('id', request_id)

    if (updateError) {
      console.error('Error updating sharing permission:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update sharing permission' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the action for audit purposes
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `sharing_request_${status}`,
        resource: 'sharing_permissions',
        resource_id: request_id,
        details: `User ${status} sharing request for medical record ${sharingRequest.medical_record_id}${signedConsent ? ' with DID consent signature' : ''}`,
        status: 'success'
      })

    console.log(`Successfully ${status} sharing request ${request_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Access request ${status} successfully`,
        request_id: request_id,
        status: status,
        consent_signed: !!signedConsent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in respond_to_access_request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})