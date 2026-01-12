
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { MlKem768 } from 'https://esm.sh/mlkem@2.3.1'
import { ethers } from 'https://esm.sh/ethers@6.15.0'

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

    console.log('Auth function called with path:', path, 'method:', req.method)

    if (path === 'login') {
      return await handleLogin(req)
    } else if (path === 'register') {
      return await handleRegister(req)
    } else if (path === 'did-login') {
      return await handleDIDLogin(req)
    } else if (path === 'did-register') {
      return await handleDIDRegister(req)
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
  try {
    console.log('Handling login request')
    const { email, password } = await req.json()

    if (!email || !password) {
      console.log('Missing email or password')
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Attempting to sign in user:', email)
    
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
      console.log('No user returned from auth')
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User authenticated successfully:', authData.user.email)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Don't fail login if profile fetch fails
    }

    // Create JWT token with user info
    const tokenPayload = {
      userId: authData.user.id,
      username: authData.user.email,
      email: authData.user.email,
      role: profile?.role || 'patient',
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }

    const token = await createJWT(tokenPayload)
    console.log('JWT token created successfully')

    return new Response(
      JSON.stringify({ token }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Login handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleRegister(req: Request) {
  try {
    console.log('Handling register request')
    const { email, password, username, role, firstName, lastName } = await req.json()

    if (!email || !password) {
      console.log('Missing email or password for registration')
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Attempting to register user:', email)

    // 🔐 Generate ML-KEM key pair
    console.log('Generating ML-KEM key pair...')
    let publicKeyBase64: string
    let privateKeyBase64: string
    
    try {
      const kem = new MlKem768()
      const [publicKey, privateKey] = await kem.generateKeyPair()
      
      publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)))
      privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)))
      
      console.log('ML-KEM key pair generated successfully')
    } catch (kemError) {
      console.error('ML-KEM key generation failed:', kemError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate quantum-safe keys' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create user with metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
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
      console.log('No user returned from registration')
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User registered successfully:', authData.user.email)

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: role || 'patient'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail registration if profile creation fails
    }

    // 🔐 Store the public key in the user_keys table
    console.log('Storing ML-KEM public key in database...')
    const { error: keyError } = await supabase
      .from('user_keys')
      .insert({
        user_id: authData.user.id,
        public_key: publicKeyBase64,
        key_type: 'mlkem-768',
        is_active: true
      })

    if (keyError) {
      console.error('Key storage error:', keyError)
      // Log error but don't fail registration - key can be regenerated later
    } else {
      console.log('ML-KEM public key stored successfully')
    }

    // Create JWT token
    const tokenPayload = {
      userId: authData.user.id,
      username: email,
      email: email,
      role: role || 'patient',
      firstName: firstName,
      lastName: lastName,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }

    const token = await createJWT(tokenPayload)
    console.log('JWT token created for new user')

    // 🔐 Return token + user's private key (for frontend storage)
    return new Response(
      JSON.stringify({ 
        token,
        user: { 
          id: authData.user.id, 
          email: email, 
          role: role || 'patient' 
        },
        privateKey: privateKeyBase64,
        quantumSafe: true
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Registration handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Registration failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// ============================================================================
// DID-BASED AUTHENTICATION (Autheo ID)
// ============================================================================

async function handleDIDLogin(req: Request) {
  try {
    console.log('Handling DID login request')
    const { walletAddress, signature, message, nonce } = await req.json()

    if (!walletAddress || !signature || !message || !nonce) {
      console.log('Missing required DID login parameters')
      return new Response(
        JSON.stringify({ error: 'Wallet address, signature, message, and nonce are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const normalizedAddress = walletAddress.toLowerCase()

    // Verify nonce exists and hasn't expired
    console.log('Verifying nonce...')
    const { data: verification, error: verifyError } = await supabase
      .from('did_verifications')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .eq('nonce', nonce)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verifyError || !verification) {
      console.error('Nonce verification failed:', verifyError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired nonce' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify signature using ethers.js
    console.log('Verifying wallet signature...')
    let recoveredAddress: string
    try {
      recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase()
    } catch (sigError) {
      console.error('Signature verification error:', sigError)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (recoveredAddress !== normalizedAddress) {
      console.error('Signature mismatch:', { recovered: recoveredAddress, expected: normalizedAddress })
      return new Response(
        JSON.stringify({ error: 'Signature verification failed' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Signature verified successfully')

    // Mark nonce as used
    await supabase
      .from('did_verifications')
      .update({ used: true })
      .eq('id', verification.id)

    // Find existing DID document for this wallet
    const did = `did:autheo:${normalizedAddress}`
    const { data: didDoc, error: didError } = await supabase
      .from('did_documents')
      .select('*, user_id')
      .eq('wallet_address', normalizedAddress)
      .eq('is_active', true)
      .single()

    if (didError || !didDoc) {
      console.log('No DID document found for wallet:', normalizedAddress)
      return new Response(
        JSON.stringify({ error: 'No Autheo ID found. Please register first.' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name, email, wallet_address')
      .eq('id', didDoc.user_id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Create JWT token with DID info
    const tokenPayload = {
      userId: didDoc.user_id,
      did: did,
      walletAddress: normalizedAddress,
      email: profile?.email,
      role: profile?.role || 'patient',
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      authMethod: 'did',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }

    const token = await createJWT(tokenPayload)
    console.log('JWT token created for DID login')

    return new Response(
      JSON.stringify({ 
        token,
        did,
        user: {
          id: didDoc.user_id,
          did: did,
          walletAddress: normalizedAddress,
          email: profile?.email,
          role: profile?.role || 'patient'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('DID login handler error:', error)
    return new Response(
      JSON.stringify({ error: 'DID login failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleDIDRegister(req: Request) {
  try {
    console.log('Handling DID registration request')
    const { walletAddress, signature, message, nonce, roles } = await req.json()

    if (!walletAddress || !signature || !message || !nonce) {
      console.log('Missing required DID registration parameters')
      return new Response(
        JSON.stringify({ error: 'Wallet address, signature, message, and nonce are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const normalizedAddress = walletAddress.toLowerCase()

    // Verify nonce exists and hasn't expired
    console.log('Verifying nonce...')
    const { data: verification, error: verifyError } = await supabase
      .from('did_verifications')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .eq('nonce', nonce)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verifyError || !verification) {
      console.error('Nonce verification failed:', verifyError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired nonce' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify signature
    console.log('Verifying wallet signature...')
    let recoveredAddress: string
    try {
      recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase()
    } catch (sigError) {
      console.error('Signature verification error:', sigError)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (recoveredAddress !== normalizedAddress) {
      console.error('Signature mismatch:', { recovered: recoveredAddress, expected: normalizedAddress })
      return new Response(
        JSON.stringify({ error: 'Signature verification failed' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Signature verified successfully')

    // Mark nonce as used
    await supabase
      .from('did_verifications')
      .update({ used: true })
      .eq('id', verification.id)

    // Check if DID already exists
    const did = `did:autheo:${normalizedAddress}`
    const { data: existingDID } = await supabase
      .from('did_documents')
      .select('id, user_id')
      .eq('wallet_address', normalizedAddress)
      .single()

    if (existingDID) {
      console.log('DID already exists, returning existing user')
      // Get profile and return login response
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, email')
        .eq('id', existingDID.user_id)
        .single()

      const tokenPayload = {
        userId: existingDID.user_id,
        did: did,
        walletAddress: normalizedAddress,
        email: profile?.email,
        role: profile?.role || 'patient',
        authMethod: 'did',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      }

      const token = await createJWT(tokenPayload)

      return new Response(
        JSON.stringify({ 
          token,
          did,
          user: {
            id: existingDID.user_id,
            did: did,
            walletAddress: normalizedAddress,
            email: profile?.email,
            role: profile?.role || 'patient'
          },
          isNewUser: false
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate ML-KEM key pair for new user
    console.log('Generating ML-KEM key pair for new DID user...')
    let publicKeyBase64: string
    let privateKeyBase64: string
    
    try {
      const kem = new MlKem768()
      const [publicKey, privateKey] = await kem.generateKeyPair()
      
      publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)))
      privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)))
      
      console.log('ML-KEM key pair generated successfully')
    } catch (kemError) {
      console.error('ML-KEM key generation failed:', kemError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate quantum-safe keys' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create new user with wallet-based email
    const walletEmail = `${normalizedAddress}@autheo.wallet`
    const randomPassword = crypto.randomUUID() // Generate random password for wallet users
    const primaryRole = roles && roles.length > 0 ? roles[0] : 'patient'

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: walletEmail,
      password: randomPassword,
      user_metadata: {
        wallet_address: normalizedAddress,
        did: did,
        role: primaryRole,
        roles: roles || ['patient'],
        auth_method: 'did'
      },
      email_confirm: true // Auto-confirm wallet users
    })

    if (authError) {
      console.error('User creation error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!authData.user) {
      console.log('No user returned from registration')
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('DID user created successfully:', authData.user.id)

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: walletEmail,
        wallet_address: normalizedAddress,
        role: primaryRole
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create DID document
    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          blockchainAccountId: `eip155:1:${normalizedAddress}`
        }
      ],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`]
    }

    const { error: didDocError } = await supabase
      .from('did_documents')
      .insert({
        user_id: authData.user.id,
        did: did,
        did_document: didDocument,
        controller: did,
        wallet_address: normalizedAddress,
        is_active: true
      })

    if (didDocError) {
      console.error('DID document creation error:', didDocError)
    }

    // Store ML-KEM public key
    const { error: keyError } = await supabase
      .from('user_keys')
      .insert({
        user_id: authData.user.id,
        public_key: publicKeyBase64,
        key_type: 'mlkem-768',
        is_active: true
      })

    if (keyError) {
      console.error('Key storage error:', keyError)
    }

    // Create JWT token
    const tokenPayload = {
      userId: authData.user.id,
      did: did,
      walletAddress: normalizedAddress,
      email: walletEmail,
      role: primaryRole,
      authMethod: 'did',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    }

    const token = await createJWT(tokenPayload)
    console.log('JWT token created for new DID user')

    return new Response(
      JSON.stringify({ 
        token,
        did,
        user: {
          id: authData.user.id,
          did: did,
          walletAddress: normalizedAddress,
          email: walletEmail,
          role: primaryRole
        },
        privateKey: privateKeyBase64,
        quantumSafe: true,
        isNewUser: true
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('DID registration handler error:', error)
    return new Response(
      JSON.stringify({ error: 'DID registration failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
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
