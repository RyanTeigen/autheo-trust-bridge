
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client for user operations
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
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

    const { record_id, fields } = await req.json()
    const encryptionKey = req.headers.get('x-encryption-key')

    if (!fields || typeof fields !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid fields object' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: 'Missing encryption key header' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simple encryption function (you can replace with more sophisticated encryption)
    const encryptWithKey = (plaintext: string, key: string): string => {
      // For now, we'll use a simple XOR encryption
      // In production, you'd want to use proper AES-GCM or similar
      let result = '';
      for (let i = 0; i < plaintext.length; i++) {
        result += String.fromCharCode(
          plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return btoa(result); // Base64 encode the result
    }

    // Create atomic data points from fields
    const inserts = Object.entries(fields).map(([data_type, value]) => ({
      owner_id: user.id,
      record_id,
      data_type,
      enc_value: encryptWithKey(String(value), encryptionKey),
      unit: getUnitForDataType(data_type), // Helper function to determine units
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'api_endpoint'
      }
    }))

    // Insert atomic data points
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase
      .from('atomic_data_points')
      .insert(inserts)

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to insert atomic data points' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted_count: inserts.length,
        message: `Successfully inserted ${inserts.length} atomic data points`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to determine appropriate units for different data types
function getUnitForDataType(dataType: string): string | undefined {
  const unitMap: Record<string, string> = {
    glucose: 'mg/dL',
    heart_rate: 'bpm',
    systolic_bp: 'mmHg',
    diastolic_bp: 'mmHg',
    temperature: '°F',
    weight: 'lbs',
    height: 'inches',
    cholesterol: 'mg/dL',
    hemoglobin: 'g/dL'
  }
  
  return unitMap[dataType.toLowerCase()]
}
