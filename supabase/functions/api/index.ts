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
    
    // Check if this is an API request (starts with /api/)
    if (pathSegments[0] !== 'api') {
      console.log('API Gateway - Not an API request')
      return new Response(
        JSON.stringify({ error: 'Not found', path: url.pathname }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Remove 'api' from path segments to get the actual endpoint
    const endpoint = pathSegments[1] // 'patients', 'auth', 'sharing-permissions', 'medical-records', etc.
    const subEndpoint = pathSegments[2] // 'login', 'register', etc.
    
    console.log('API Gateway - Endpoint:', endpoint)
    console.log('API Gateway - Sub-endpoint:', subEndpoint)
    
    // Route to auth endpoints
    if (endpoint === 'auth') {
      const authEndpoint = subEndpoint // 'login' or 'register'
      
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
    if (endpoint === 'patients') {
      console.log('API Gateway - Routing to patients function')
      
      // Forward to patients function, preserving query parameters
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
      console.log('API Gateway - Patients response data:', data)
      
      return new Response(data, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Route to sharing permissions endpoints
    if (endpoint === 'sharing-permissions') {
      console.log('API Gateway - Routing to sharing-permissions function')
      
      // Build the path for the sharing permissions function
      // Remove the first two segments (/api/sharing-permissions) and keep the rest
      const remainingPath = pathSegments.slice(2).join('/')
      const sharingUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/sharing-permissions${remainingPath ? '/' + remainingPath : ''}`
      
      console.log('API Gateway - Forwarding to:', sharingUrl + url.search)
      
      const response = await fetch(sharingUrl + url.search, {
        method: req.method,
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? await req.text() : undefined,
      })
      
      const data = await response.text()
      
      console.log('API Gateway - Sharing permissions response status:', response.status)
      console.log('API Gateway - Sharing permissions response data:', data)
      
      return new Response(data, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Route to medical records endpoints
    if (endpoint === 'medical-records') {
      console.log('API Gateway - Routing to medical-records function')
      
      // Build the path for the medical records function
      // Remove the first two segments (/api/medical-records) and keep the rest
      const remainingPath = pathSegments.slice(2).join('/')
      const recordsUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/medical-records${remainingPath ? '/' + remainingPath : ''}`
      
      console.log('API Gateway - Forwarding to:', recordsUrl + url.search)
      
      const response = await fetch(recordsUrl + url.search, {
        method: req.method,
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? await req.text() : undefined,
      })
      
      const data = await response.text()
      
      console.log('API Gateway - Medical records response status:', response.status)
      console.log('API Gateway - Medical records response data:', data)
      
      return new Response(data, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log('API Gateway - No matching endpoint found for:', endpoint)
    return new Response(
      JSON.stringify({ error: 'Endpoint not found', endpoint, path: url.pathname }),
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
