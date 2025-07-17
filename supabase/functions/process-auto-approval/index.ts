import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoApprovalRule {
  id: string;
  conditions: {
    permission_type?: string[];
    department?: string[];
    urgency_level?: string[];
    max_duration_hours?: number;
  };
  actions: {
    auto_approve: boolean;
    notification_delay_hours?: number;
    require_justification?: boolean;
  };
  is_active: boolean;
}

interface AccessRequest {
  id: string;
  patient_id: string;
  grantee_id: string;
  permission_type: string;
  department?: string;
  urgency_level?: string;
  clinical_justification?: string;
  expires_at?: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId } = await req.json();
    
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing auto-approval for request:', requestId);

    // Fetch the access request
    const { data: request, error: requestError } = await supabaseClient
      .from('sharing_permissions')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      console.error('Error fetching request:', requestError);
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if request is not pending
    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          message: 'Request is not pending', 
          status: request.status 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch active auto-approval rules for this patient
    const { data: rules, error: rulesError } = await supabaseClient
      .from('workflow_automation_rules')
      .select('*')
      .eq('created_by', request.patient_id)
      .eq('rule_type', 'auto_approval')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch auto-approval rules' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!rules || rules.length === 0) {
      console.log('No active auto-approval rules found for patient:', request.patient_id);
      return new Response(
        JSON.stringify({ message: 'No auto-approval rules found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if request matches any auto-approval rule
    let matchedRule: AutoApprovalRule | null = null;

    for (const rule of rules) {
      const conditions = rule.conditions as any;
      const actions = rule.actions as any;
      
      let matches = true;

      // Check permission type
      if (conditions.permission_type && conditions.permission_type.length > 0) {
        if (!conditions.permission_type.includes(request.permission_type)) {
          matches = false;
        }
      }

      // Check department
      if (matches && conditions.department && conditions.department.length > 0) {
        if (!request.department || !conditions.department.includes(request.department)) {
          matches = false;
        }
      }

      // Check urgency level
      if (matches && conditions.urgency_level && conditions.urgency_level.length > 0) {
        if (!request.urgency_level || !conditions.urgency_level.includes(request.urgency_level)) {
          matches = false;
        }
      }

      // Check justification requirement
      if (matches && actions.require_justification) {
        if (!request.clinical_justification || request.clinical_justification.trim().length === 0) {
          matches = false;
        }
      }

      // Check duration
      if (matches && conditions.max_duration_hours && request.expires_at) {
        const requestDuration = new Date(request.expires_at).getTime() - new Date(request.created_at).getTime();
        const maxDuration = conditions.max_duration_hours * 60 * 60 * 1000; // Convert to milliseconds
        
        if (requestDuration > maxDuration) {
          matches = false;
        }
      }

      if (matches && actions.auto_approve) {
        matchedRule = {
          id: rule.id,
          conditions,
          actions,
          is_active: rule.is_active
        };
        break;
      }
    }

    if (!matchedRule) {
      console.log('No matching auto-approval rule found for request:', requestId);
      return new Response(
        JSON.stringify({ message: 'No matching auto-approval rule found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found matching rule:', matchedRule.id, 'for request:', requestId);

    // Auto-approve the request
    const { error: updateError } = await supabaseClient
      .from('sharing_permissions')
      .update({
        status: 'approved',
        responded_at: new Date().toISOString(),
        decision_note: `Auto-approved by rule: ${matchedRule.id}`,
        auto_approved: true
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error auto-approving request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to auto-approve request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create audit log entry
    const { error: auditError } = await supabaseClient
      .from('access_request_audit')
      .insert({
        request_id: requestId,
        action: 'AUTO_APPROVED',
        old_status: 'pending',
        new_status: 'approved',
        performed_by: request.patient_id,
        notes: `Automatically approved by rule: ${matchedRule.id}`,
        metadata: {
          rule_id: matchedRule.id,
          rule_conditions: matchedRule.conditions,
          automated: true
        }
      });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request for audit log errors
    }

    // Create notification for the provider
    const { error: notificationError } = await supabaseClient
      .from('patient_notifications')
      .insert({
        patient_id: request.patient_id,
        notification_type: 'access_approved',
        title: 'Access Request Auto-Approved',
        message: `Your access request has been automatically approved based on patient preferences.`,
        priority: 'normal',
        data: {
          request_id: requestId,
          grantee_id: request.grantee_id,
          permission_type: request.permission_type,
          automated: true
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request for notification errors
    }

    console.log('Successfully auto-approved request:', requestId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Request auto-approved successfully',
        rule_id: matchedRule.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-auto-approval function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});