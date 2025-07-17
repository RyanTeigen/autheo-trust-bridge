import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { requestId, request_id, medical_record_id, grantee_id, decision, status, decision_note } = await req.json()

    console.log('Processing access request response:', {
      requestId,
      request_id,
      medical_record_id,
      grantee_id,
      decision,
      status,
      decision_note
    })

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !userData.user) {
      console.error('User authentication error:', userError)
      throw new Error('User not authenticated')
    }

    const userId = userData.user.id

    // Handle different parameter formats
    const actualRequestId = requestId || request_id
    const actualDecision = decision || status
    
    let updateData: any = {}

    if (actualRequestId) {
      // Update by request ID
      updateData = {
        status: actualDecision,
        responded_at: new Date().toISOString(),
        decision_note: decision_note || null
      }

      // First get the request details
      const { data: requestData, error: requestError } = await supabaseClient
        .from('sharing_permissions')
        .select('*')
        .eq('id', actualRequestId)
        .single()

      if (requestError) {
        console.error('Error fetching request:', requestError)
        throw new Error('Request not found')
      }

      // Verify the user owns this request (patient can respond to their own requests)
      if (requestData.patient_id !== userId) {
        throw new Error('Unauthorized: You can only respond to your own requests')
      }

      // Update the request
      const { error: updateError } = await supabaseClient
        .from('sharing_permissions')
        .update(updateData)
        .eq('id', actualRequestId)

      if (updateError) {
        console.error('Error updating request:', updateError)
        throw new Error('Failed to update request')
      }

    } else if (medical_record_id && grantee_id) {
      // Update by medical record and grantee IDs
      updateData = {
        status: actualDecision,
        responded_at: new Date().toISOString(),
        decision_note: decision_note || null
      }

      const { error: updateError } = await supabaseClient
        .from('sharing_permissions')
        .update(updateData)
        .eq('medical_record_id', medical_record_id)
        .eq('grantee_id', grantee_id)
        .eq('status', 'pending')

      if (updateError) {
        console.error('Error updating request:', updateError)
        throw new Error('Failed to update request')
      }
    } else {
      throw new Error('Invalid request parameters')
    }

    // Create audit log entry
    const auditData = {
      request_id: actualRequestId,
      action: actualDecision === 'approved' ? 'APPROVE' : 'REJECT',
      old_status: 'pending',
      new_status: actualDecision,
      performed_by: userId,
      notes: decision_note || null,
      metadata: {
        timestamp: new Date().toISOString(),
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')
      }
    }

    const { error: auditError } = await supabaseClient
      .from('access_request_audit')
      .insert(auditData)

    if (auditError) {
      console.error('Error creating audit log:', auditError)
      // Don't fail the request for audit log errors
    }

    // Create notification for status change
    if (actualRequestId) {
      const { data: requestData } = await supabaseClient
        .from('sharing_permissions')
        .select('patient_id, grantee_id')
        .eq('id', actualRequestId)
        .single()

      if (requestData) {
        const notificationMessage = actualDecision === 'approved' 
          ? 'Your access request has been approved by the patient.'
          : 'Your access request has been declined by the patient.'

        const { error: notificationError } = await supabaseClient
          .from('patient_notifications')
          .insert({
            patient_id: requestData.patient_id,
            notification_type: actualDecision === 'approved' ? 'access_granted' : 'access_revoked',
            title: actualDecision === 'approved' ? 'Access Granted' : 'Access Declined',
            message: notificationMessage,
            priority: 'normal',
            data: {
              request_id: actualRequestId,
              grantee_id: requestData.grantee_id,
              decision: actualDecision,
              decision_note: decision_note
            }
          })

        if (notificationError) {
          console.error('Error creating notification:', notificationError)
        }
      }
    }

    console.log('Access request response processed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Access request updated successfully',
        status: actualDecision
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing access request:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process access request' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})