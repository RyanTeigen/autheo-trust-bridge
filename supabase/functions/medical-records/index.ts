
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Simple encryption function (in production, use proper encryption)
function encrypt(text: string): string {
  return btoa(text) // Base64 encoding - replace with proper encryption
}

function decrypt(encrypted: string): string {
  return atob(encrypted) // Base64 decoding - replace with proper decryption
}

serve(async (req) => {
  console.log('Medical records function - Request received:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Medical records function - Auth header present:', !!authHeader)
    
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
    
    console.log('Medical records function - User authenticated:', !!user)
    console.log('Medical records function - Auth error:', authError)
    
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
    const recordId = pathSegments[1] // For operations on specific records

    if (req.method === 'GET') {
      if (recordId) {
        // Get specific medical record
        const { data: record, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('id', recordId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ success: false, error: 'Medical record not found' }),
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

        // Decrypt the record data
        const decryptedData = decrypt(record.encrypted_data)
        const recordWithDecryptedData = {
          ...record,
          data: JSON.parse(decryptedData)
        }

        return new Response(
          JSON.stringify({ success: true, data: recordWithDecryptedData }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // Get all medical records for the user
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const offset = parseInt(url.searchParams.get('offset') || '0')
        const recordType = url.searchParams.get('recordType')

        let query = supabase
          .from('medical_records')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (recordType && recordType !== 'all') {
          query = query.eq('record_type', recordType)
        }

        const { data: records, error, count } = await query
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

        // Decrypt all records
        const decryptedRecords = (records || []).map(record => {
          const decryptedData = decrypt(record.encrypted_data)
          return {
            ...record,
            data: JSON.parse(decryptedData)
          }
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              records: decryptedRecords,
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
      console.log('Medical records function - Creating record with data:', body)
      
      const { title, description, recordType = 'general', ...otherData } = body
      
      // Validate required fields
      if (!title) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Title is required' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Encrypt the record data
      const recordData = {
        title,
        description,
        ...otherData,
        createdAt: new Date().toISOString()
      }
      const encryptedData = encrypt(JSON.stringify(recordData))

      // Create new medical record
      const { data: record, error } = await supabase
        .from('medical_records')
        .insert([{
          user_id: user.id,
          patient_id: user.id,
          encrypted_data: encryptedData,
          record_type: recordType
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create medical record',
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
          data: {
            ...record,
            data: recordData
          }
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'PUT' && recordId) {
      const body = await req.json()
      const { title, description, recordType, ...otherData } = body

      // Get existing record to merge data
      const { data: existingRecord, error: fetchError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Record not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Decrypt existing data and merge with new data
      const existingData = JSON.parse(decrypt(existingRecord.encrypted_data))
      const updatedData = {
        ...existingData,
        title: title || existingData.title,
        description: description !== undefined ? description : existingData.description,
        ...otherData,
        updatedAt: new Date().toISOString()
      }

      // Encrypt updated data
      const encryptedData = encrypt(JSON.stringify(updatedData))

      // Build update object
      const updateFields: any = {
        encrypted_data: encryptedData,
        updated_at: new Date().toISOString()
      }

      if (recordType) {
        updateFields.record_type = recordType
      }

      const { data: record, error } = await supabase
        .from('medical_records')
        .update(updateFields)
        .eq('id', recordId)
        .eq('user_id', user.id)
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
        JSON.stringify({ 
          success: true, 
          data: {
            ...record,
            data: updatedData
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'DELETE' && recordId) {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id)

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
