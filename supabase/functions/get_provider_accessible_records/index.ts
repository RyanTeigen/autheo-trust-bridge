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

    // Verify user is a provider
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'provider') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Provider role required.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get sharing permissions for this provider first
    const { data: permissions, error: permissionsError } = await supabase
      .from('sharing_permissions')
      .select('medical_record_id, permission_type, responded_at, id')
      .eq('grantee_id', user.id)
      .eq('status', 'approved')

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch permissions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!permissions || permissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          count: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the medical records for approved permissions
    const recordIds = permissions.map(p => p.medical_record_id)
    const { data: accessibleRecords, error: recordsError } = await supabase
      .from('medical_records')
      .select(`
        id,
        record_type,
        created_at,
        patient_id,
        encrypted_data
      `)
      .in('id', recordIds)

    if (recordsError) {
      console.error('Error fetching accessible records:', recordsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch accessible records' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get patient information for each record
    const patientIds = [...new Set(accessibleRecords?.map(r => r.patient_id).filter(Boolean))]
    const { data: patients } = await supabase
      .from('patients')
      .select('id, full_name, email, user_id')
      .in('id', patientIds)

    // Combine the data
    const enrichedRecords = accessibleRecords?.map(record => {
      const patient = patients?.find(p => p.id === record.patient_id)
      const permission = permissions.find(p => p.medical_record_id === record.id)
      
      return {
        ...record,
        patients: patient || { full_name: 'Unknown Patient', email: null, user_id: null },
        sharing_permissions: [permission || { permission_type: 'read', responded_at: record.created_at }]
      }
    }) || []

    // Log the access attempt
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'VIEWED_ACCESSIBLE_RECORDS',
      resource: 'medical_records',
      status: 'success',
      details: `Provider accessed ${enrichedRecords.length} shared medical records`,
      metadata: {
        record_count: enrichedRecords.length,
        access_timestamp: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: enrichedRecords,
        count: enrichedRecords.length
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