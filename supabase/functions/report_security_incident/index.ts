import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { type, description, date } = await req.json()
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }), 
        { status: 401, headers: corsHeaders }
      )
    }

    // Verify the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('User verification failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: corsHeaders }
      )
    }

    // Validate required fields
    if (!type || !date) {
      return new Response(
        JSON.stringify({ error: 'Type and date are required fields' }), 
        { status: 400, headers: corsHeaders }
      )
    }

    // Insert the incident report
    const { error: insertError } = await supabaseClient
      .from('incident_reports')
      .insert({
        user_id: user.id,
        type,
        description: description || null,
        date,
      })

    if (insertError) {
      console.error('Database insertion error:', insertError)
      return new Response(
        JSON.stringify({ error: insertError.message }), 
        { status: 500, headers: corsHeaders }
      )
    }

    console.log(`Security incident reported by user ${user.id}: ${type}`)

    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error processing incident report:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: corsHeaders }
    )
  }
})