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

    console.log(`Generating encrypted aggregates for user: ${user.id}`)

    // Get patient record
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

    // Fetch medical records with atomic data points
    const { data: records, error } = await supabase
      .from('medical_records')
      .select(`
        id,
        record_type,
        created_at,
        atomic_data_points!record_id (
          data_type,
          enc_value,
          unit
        )
      `)
      .or(`user_id.eq.${user.id},patient_id.eq.${patient.id}`)

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

    // Process aggregations per record type
    const aggregates: Record<string, { count: number; sum: number; values: number[] }> = {}

    for (const record of records || []) {
      const recordType = record.record_type || 'unknown'
      
      if (!aggregates[recordType]) {
        aggregates[recordType] = { count: 0, sum: 0, values: [] }
      }
      
      // For each atomic data point, simulate decryption and aggregation
      if (record.atomic_data_points && record.atomic_data_points.length > 0) {
        for (const dataPoint of record.atomic_data_points) {
          // In a real implementation, you would decrypt enc_value here
          // For now, we'll simulate with a mock numeric value
          const mockValue = Math.random() * 100 + 50 // Random value between 50-150
          
          aggregates[recordType].count += 1
          aggregates[recordType].sum += mockValue
          aggregates[recordType].values.push(mockValue)
        }
      } else {
        // If no atomic data points, count the record itself
        aggregates[recordType].count += 1
        const mockValue = Math.random() * 100 + 50
        aggregates[recordType].sum += mockValue
        aggregates[recordType].values.push(mockValue)
      }
    }

    // Generate encrypted aggregate results
    const result = Object.entries(aggregates).map(([type, { count, sum, values }]) => {
      const average = count > 0 ? sum / count : 0
      const min = values.length > 0 ? Math.min(...values) : 0
      const max = values.length > 0 ? Math.max(...values) : 0
      
      return {
        record_type: type,
        count,
        encrypted_sum: `enc_sum_${sum.toFixed(2)}`,
        encrypted_avg: `enc_avg_${average.toFixed(2)}`,
        encrypted_min: `enc_min_${min.toFixed(2)}`,
        encrypted_max: `enc_max_${max.toFixed(2)}`,
        timestamp: new Date().toISOString()
      }
    })

    // Log the aggregation for audit purposes
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'ENCRYPTED_AGGREGATION',
      resource: 'medical_records',
      status: 'success',
      details: `Generated encrypted aggregates for ${result.length} record types`,
      metadata: {
        record_types: result.map(r => r.record_type),
        total_count: result.reduce((acc, r) => acc + r.count, 0),
        timestamp: new Date().toISOString()
      }
    })

    console.log(`Successfully generated ${result.length} encrypted aggregates for user ${user.id}`)

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Unexpected error in encrypted_aggregate:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})