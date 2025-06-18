
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    if (path === 'login') {
      return await handleLogin(req)
    } else if (path === 'register') {
      return await handleRegister(req)
    } else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Auth function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleLogin(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error('Login error:', authError)
    return new Response(
      JSON.stringify({ error: authError.message }),
      { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  if (!authData.user) {
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user profile' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Create JWT token with user info
  const tokenPayload = {
    userId: authData.user.id,
    username: profile.username || authData.user.email,
    role: profile.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }

  const token = await createJWT(tokenPayload)

  return new Response(
    JSON.stringify({ token }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleRegister(req: Request) {
  const { email, password, username, role, firstName, lastName } = await req.json()

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Create user with metadata
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      username: username || email,
      firstName,
      lastName,
      role: role || 'patient'
    },
    email_confirm: false // Skip email confirmation for development
  })

  if (authError) {
    console.error('Registration error:', authError)
    return new Response(
      JSON.stringify({ error: authError.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  if (!authData.user) {
    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // The profile will be created automatically by the trigger
  // Wait a moment and then fetch the profile
  await new Promise(resolve => setTimeout(resolve, 100))

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error after registration:', profileError)
    // Still return success since user was created
  }

  // Create JWT token
  const tokenPayload = {
    userId: authData.user.id,
    username: profile?.username || username || email,
    role: profile?.role || role || 'patient',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }

  const token = await createJWT(tokenPayload)

  return new Response(
    JSON.stringify({ token }),
    { 
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Simple JWT creation (for demo purposes - in production use a proper JWT library)
async function createJWT(payload: any): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '')
  
  const secret = Deno.env.get('JWT_SECRET') || 'your-secret-key'
  const data = `${encodedHeader}.${encodedPayload}`
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '')
  
  return `${data}.${encodedSignature}`
}
