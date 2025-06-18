
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  console.log('Sharing permissions function - Request received:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Sharing permissions function - Auth header present:', !!authHeader)
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('Sharing permissions function - User authenticated:', !!user)
    console.log('Sharing permissions function - Auth error:', authError)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: authError?.message }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const permissionId = pathSegments[1] // For operations on specific permissions

    if (req.method === 'GET') {
      if (permissionId) {
        // Get specific sharing permission
        const { data: permission, error } = await supabase
          .from('sharing_permissions')
          .select('*')
          .eq('id', permissionId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ success: false, error: 'Sharing permission not found' }),
              { 
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: permission }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // Get all sharing permissions for the user
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const offset = parseInt(url.searchParams.get('offset') || '0')
        const granteeId = url.searchParams.get('granteeId')
        const permissionType = url.searchParams.get('permissionType')
        const status = url.searchParams.get('status')

        let query = supabase
          .from('sharing_permissions')
          .select('*', { count: 'exact' })
          .eq('patient_id', user.id)

        if (granteeId) {
          query = query.eq('grantee_id', granteeId)
        }

        if (permissionType) {
          query = query.eq('permission_type', permissionType)
        }

        if (status === 'active') {
          query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        } else if (status === 'expired') {
          query = query.lt('expires_at', new Date().toISOString())
        }

        const { data: permissions, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              permissions: permissions || [],
              totalCount: count || 0,
              pagination: {
                limit,
                offset,
                hasMore: offset + limit < (count || 0)
              }
            }
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Sharing permissions function - Creating permission with data:', body)
      
      const { medicalRecordId, granteeId, permissionType, expiresAt } = body
      
      // Validate required fields
      if (!medicalRecordId || !granteeId || !permissionType) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing required fields: medicalRecordId, granteeId, and permissionType are required' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Verify the medical record belongs to the current user
      const { data: record, error: recordError } = await supabase
        .from('medical_records')
        .select('patient_id')
        .eq('id', medicalRecordId)
        .single()

      if (recordError || !record) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Medical record not found or access denied' 
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Create new sharing permission
      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .insert([{
          patient_id: user.id,
          medical_record_id: medicalRecordId,
          grantee_id: granteeId,
          permission_type: permissionType,
          expires_at: expiresAt || null
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create sharing permission',
            details: error.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: permission 
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'PUT' && permissionId) {
      const body = await req.json()
      const { permissionType, expiresAt } = body

      // Build update object
      const updateFields: any = {}
      if (permissionType) updateFields.permission_type = permissionType
      if (expiresAt !== undefined) updateFields.expires_at = expiresAt

      if (Object.keys(updateFields).length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'No fields to update' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .update(updateFields)
        .eq('id', permissionId)
        .eq('patient_id', user.id) // Ensure user owns this permission
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: permission }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'DELETE' && permissionId) {
      const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', permissionId)
        .eq('patient_id', user.id) // Ensure user owns this permission

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
