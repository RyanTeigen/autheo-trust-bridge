import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Parse request body and URL parameters
    let action, deviceType, requestBody = {};
    
    if (req.method === 'POST') {
      try {
        const bodyText = await req.text()
        if (bodyText) {
          requestBody = JSON.parse(bodyText)
          action = requestBody.action
          deviceType = requestBody.device_type
        }
      } catch (e) {
        console.error('Error parsing request body:', e)
        // Continue without throwing to allow URL parameter fallback
      }
    }

    // Also check URL parameters as fallback
    const url = new URL(req.url)
    if (!action) action = url.searchParams.get('action')
    if (!deviceType) deviceType = url.searchParams.get('device_type')

    // Handle OAuth callback with parameters from URL
    if (action === 'oauth_callback' || url.searchParams.get('code')) {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')
      
      console.log('OAuth callback received:', { code: code ? 'present' : 'missing', state, error })
      
      if (error) {
        return new Response(
          JSON.stringify({ error: `OAuth error: ${error}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return await handleOAuthCallback(supabase, deviceType, code, state, user.id)
    }

    console.log('Fitness integration request:', { 
      method: req.method,
      action, 
      deviceType, 
      hasBody: Object.keys(requestBody).length > 0,
      urlParams: Object.fromEntries(url.searchParams.entries())
    })

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    switch (action) {
      case 'oauth_url':
        if (!deviceType) {
          return new Response(
            JSON.stringify({ error: 'Missing device_type parameter for oauth_url' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        return await generateOAuthUrl(deviceType, user.id)
      
      case 'sync_data':
        if (!deviceType) {
          return new Response(
            JSON.stringify({ error: 'Missing device_type parameter for sync_data' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        return await syncDeviceData(supabase, deviceType, user.id)
      
      case 'disconnect':
        if (!deviceType) {
          return new Response(
            JSON.stringify({ error: 'Missing device_type parameter for disconnect' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        return await disconnectDevice(supabase, deviceType, user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Fitness integration error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateOAuthUrl(deviceType: string, userId: string) {
  try {
    const clientId = Deno.env.get('STRAVA_CLIENT_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    
    if (!clientId) {
      throw new Error('Missing Strava client ID')
    }

    if (!supabaseUrl) {
      throw new Error('Missing Supabase URL')
    }

    // Use the exact format that should be registered in Strava
    const redirectUri = `${supabaseUrl}/functions/v1/fitness-integration`
    
    // Include device type in the state parameter
    const state = `${userId}-${deviceType}-${Date.now()}`
    
    let authUrl = ''
    
    switch (deviceType) {
      case 'strava':
        authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=read,activity:read_all,profile:read_all&state=${state}`
        break
      
      case 'garmin':
        throw new Error('Garmin integration not yet implemented')
      
      case 'whoop':
        throw new Error('WHOOP integration not yet implemented')
      
      default:
        throw new Error('Unsupported device type')
    }

    console.log('Generated OAuth URL for', deviceType, ':', authUrl)
    console.log('Redirect URI:', redirectUri)

    return new Response(
      JSON.stringify({ authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating OAuth URL:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleOAuthCallback(supabase: any, deviceType: string, code: string, state: string, userId: string) {
  console.log('Handling OAuth callback for:', deviceType, 'with code:', code ? 'present' : 'missing')
  
  if (!code) {
    throw new Error('Missing authorization code')
  }

  // Parse the state parameter to get device type and verify user ID
  const stateParts = state?.split('-')
  if (!stateParts || stateParts.length < 3 || !stateParts[0] || !stateParts[1]) {
    throw new Error('Invalid state parameter')
  }
  
  const stateUserId = stateParts[0]
  const stateDeviceType = stateParts[1]
  
  // Verify state parameter contains our user ID and device type
  if (stateUserId !== userId) {
    throw new Error('Invalid state parameter - user mismatch')
  }
  
  // Use device type from state if not provided in the request
  if (!deviceType) {
    deviceType = stateDeviceType
  }

  switch (deviceType) {
    case 'strava':
      return await handleStravaCallback(supabase, code, userId)
    
    default:
      throw new Error('Unsupported device type')
  }
}

async function handleStravaCallback(supabase: any, code: string, userId: string) {
  const clientId = Deno.env.get('STRAVA_CLIENT_ID')
  const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing Strava credentials')
  }

  console.log('Exchanging code for tokens with Strava...')

  // Exchange code for tokens
  const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code'
    })
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('Strava token exchange failed:', errorText)
    throw new Error('Failed to exchange code for tokens')
  }

  const tokenData = await tokenResponse.json()
  console.log('Received tokens from Strava for athlete:', tokenData.athlete?.id)
  
  // Store integration in database
  const { error: insertError } = await supabase
    .from('fitness_integrations')
    .upsert({
      user_id: userId,
      device_type: 'strava',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      athlete_id: tokenData.athlete.id.toString(),
      is_connected: true,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,device_type'
    })

  if (insertError) {
    console.error('Database insert error:', insertError)
    throw new Error('Failed to store integration')
  }

  // Fetch initial data
  await syncStravaData(supabase, userId, tokenData.access_token)

  // Return success response with redirect to close the OAuth window
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Strava Connected</title>
      <script>
        // Close the OAuth popup and notify parent window
        if (window.opener) {
          window.opener.postMessage({ type: 'strava_connected', success: true }, '*');
          window.close();
        } else {
          // If not in popup, redirect to app
          window.location.href = '${Deno.env.get('SITE_URL') || 'https://bef2344b-0d7b-4bef-a762-ede2111f1bda.lovableproject.com'}/health-tracker';
        }
      </script>
    </head>
    <body>
      <h1>Strava Connected Successfully!</h1>
      <p>You can close this window and return to the app.</p>
    </body>
    </html>`,
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html' 
      } 
    }
  )
}

async function syncDeviceData(supabase: any, deviceType: string, userId: string) {
  // Get integration
  const { data: integration, error } = await supabase
    .from('fitness_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('device_type', deviceType)
    .single()

  if (error || !integration) {
    throw new Error('Integration not found')
  }

  if (!integration.is_connected) {
    throw new Error('Device not connected')
  }

  switch (deviceType) {
    case 'strava':
      return await syncStravaData(supabase, userId, integration.access_token)
    
    default:
      throw new Error('Unsupported device type')
  }
}

async function syncStravaData(supabase: any, userId: string, accessToken: string) {
  console.log('Syncing Strava data for user:', userId)
  
  // Get recent activities
  const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!activitiesResponse.ok) {
    const errorText = await activitiesResponse.text()
    console.error('Strava API error:', errorText)
    throw new Error('Failed to fetch Strava activities')
  }

  const activities = await activitiesResponse.json()
  console.log(`Found ${activities.length} activities for user ${userId}`)
  
  // Get integration ID
  const { data: integration } = await supabase
    .from('fitness_integrations')
    .select('id')
    .eq('user_id', userId)
    .eq('device_type', 'strava')
    .single()

  if (integration && activities.length > 0) {
    // Store activities in database
    const fitnessData = activities.map((activity: any) => ({
      user_id: userId,
      integration_id: integration.id,
      data_type: 'activity',
      external_id: activity.id.toString(),
      data: {
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        start_date: activity.start_date,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        calories: activity.calories
      },
      recorded_at: activity.start_date
    }))
    
    // Insert fitness data, ignoring duplicates
    const { error: dataError } = await supabase
      .from('fitness_data')
      .upsert(fitnessData, {
        onConflict: 'user_id,external_id,data_type',
        ignoreDuplicates: true
      })

    if (dataError) {
      console.error('Error storing fitness data:', dataError)
    } else {
      console.log(`Successfully stored ${fitnessData.length} activities`)
    }
  }

  // Update last sync time
  await supabase
    .from('fitness_integrations')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('device_type', 'strava')

  return new Response(
    JSON.stringify({ success: true, activities_synced: activities.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function disconnectDevice(supabase: any, deviceType: string, userId: string) {
  console.log('Disconnecting device:', deviceType, 'for user:', userId)
  
  // Update integration to disconnected
  const { error } = await supabase
    .from('fitness_integrations')
    .update({ 
      is_connected: false,
      access_token: null,
      refresh_token: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('device_type', deviceType)

  if (error) {
    throw new Error('Failed to disconnect device')
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
