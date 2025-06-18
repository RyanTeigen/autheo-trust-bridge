
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    console.log('API Gateway - Request path:', url.pathname)
    console.log('API Gateway - Path segments:', pathSegments)
    
    // Route to auth endpoints
    if (pathSegments[0] === 'auth') {
      const authEndpoint = pathSegments[1] // 'login' or 'register'
      
      // Forward to auth function
      const authUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/auth/${authEndpoint}`
      
      const response = await fetch(authUrl, {
        method: req.method,
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? await req.text() : undefined,
      })
      
      const data = await response.text()
      
      return new Response(data, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Route to patients endpoints
    if (pathSegments[0] === 'patients') {
      console.log('API Gateway - Routing to patients function')
      
      // Forward to patients function
      const patientsUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/patients`
      
      console.log('API Gateway - Forwarding to:', patientsUrl + url.search)
      
      const response = await fetch(patientsUrl + url.search, {
        method: req.method,
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? await req.text() : undefined,
      })
      
      const data = await response.text()
      
      console.log('API Gateway - Patients response status:', response.status)
      
      return new Response(data, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log('API Gateway - No matching route found')
    return new Response(
      JSON.stringify({ error: 'Not found', path: url.pathname }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('API gateway error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
