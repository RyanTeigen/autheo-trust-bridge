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
    // Initialize Supabase client with user context
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

    console.log(`Exporting records for user: ${user.id}`)

    // Get patient record first
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!patient) {
      return new Response(
        JSON.stringify({ error: 'Patient record not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch all approved records with specific fields
    const { data: records, error } = await supabase
      .from('medical_records')
      .select(`
        id,
        record_type,
        created_at,
        provider_id,
        encrypted_data,
        sharing_permissions!medical_record_id (
          status,
          signed_consent
        ),
        anchored_hashes!record_id (
          record_hash
        )
      `)
      .or(`user_id.eq.${user.id},patient_id.eq.${patient.id}`)
      .eq('sharing_permissions.status', 'approved')

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch records' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format the output exactly as specified
    const exportData = (records || []).map(r => ({
      id: r.id,
      type: r.record_type,
      unit: 'N/A', // Will be populated from atomic data if available
      timestamp: r.created_at,
      provider_id: r.provider_id || 'self',
      encrypted_value: r.encrypted_data ? 'encrypted' : 'N/A',
      anchor_hash: r.anchored_hashes?.[0]?.record_hash || 'N/A',
      status: r.sharing_permissions?.[0]?.status || 'unknown'
    }))

    // Log the export for audit purposes
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'SECURE_EXPORT_RECORDS',
      resource: 'medical_records',
      status: 'success',
      details: `Exported ${exportData.length} approved records via edge function`,
      metadata: {
        export_format: 'json',
        records_count: exportData.length,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`Successfully exported ${exportData.length} records for user ${user.id}`)

    return new Response(JSON.stringify(exportData), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="health-records-${new Date().toISOString()}.json"`
      }
    })

  } catch (error) {
    console.error('Unexpected error in export_records:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})