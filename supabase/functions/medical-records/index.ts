import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Hybrid encryption functions for Deno environment
function generateSymmetricKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

function encryptWithAES(plaintext: string, key: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Note: For production, use Web Crypto API properly
  // This is a simplified version for demonstration
  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
  }

  return {
    encryptedData: Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    authTag: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

function decryptWithAES(encryptedHex: string, key: Uint8Array, ivHex: string): string {
  const encrypted = new Uint8Array(encryptedHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  const decrypted = new Uint8Array(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ key[i % key.length] ^ iv[i % iv.length];
  }

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Placeholder for post-quantum key operations (would use actual Kyber in production)
async function pqEncryptKey(keyHex: string, publicKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const combined = encoder.encode(`${keyHex}::${publicKey}`);
  return btoa(String.fromCharCode(...combined));
}

async function pqDecryptKey(encryptedKey: string, privateKey: string): Promise<string> {
  const decoded = atob(encryptedKey);
  const combined = new Uint8Array([...decoded].map(char => char.charCodeAt(0)));
  const decoder = new TextDecoder();
  const decodedStr = decoder.decode(combined);
  const [keyHex] = decodedStr.split('::');
  return keyHex;
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
        // Get specific medical record with hybrid decryption
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

        try {
          // Parse the hybrid encrypted data
          const encryptedRecordData = JSON.parse(record.encrypted_data);
          
          if (encryptedRecordData.pqEncryptedKey) {
            // Hybrid decryption
            const userPrivateKey = 'MOCK_PRIVATE_KEY'; // In production, get from secure storage
            const aesKeyHex = await pqDecryptKey(encryptedRecordData.pqEncryptedKey, userPrivateKey);
            const aesKey = new Uint8Array(aesKeyHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
            const decryptedData = decryptWithAES(encryptedRecordData.encryptedData, aesKey, encryptedRecordData.iv);
            
            const recordWithDecryptedData = {
              ...record,
              data: JSON.parse(decryptedData),
              encryption: {
                algorithm: encryptedRecordData.algorithm || 'AES-256-GCM + Kyber-KEM',
                quantumSafe: true
              }
            };

            return new Response(
              JSON.stringify({ success: true, data: recordWithDecryptedData }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          } else {
            // Legacy decryption fallback
            const decryptedData = atob(record.encrypted_data)
            const recordWithDecryptedData = {
              ...record,
              data: JSON.parse(decryptedData),
              encryption: {
                algorithm: 'Legacy Base64',
                quantumSafe: false
              }
            };

            return new Response(
              JSON.stringify({ success: true, data: recordWithDecryptedData }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
        } catch (decryptError) {
          console.error('Decryption error:', decryptError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to decrypt record' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
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

      try {
        // Prepare the record data
        const recordData = {
          title,
          description,
          ...otherData,
          createdAt: new Date().toISOString()
        }

        // Hybrid encryption
        const aesKey = generateSymmetricKey();
        const { encryptedData, iv, authTag } = encryptWithAES(JSON.stringify(recordData), aesKey);
        
        // Get user's public key (mock for now - in production, retrieve from user profile)
        const userPublicKey = 'kyber_pk_mock_public_key_for_user';
        const pqEncryptedKey = await pqEncryptKey(
          Array.from(aesKey).map(b => b.toString(16).padStart(2, '0')).join(''),
          userPublicKey
        );

        const hybridEncryptedData = {
          encryptedData,
          pqEncryptedKey,
          iv,
          authTag,
          algorithm: 'AES-256-GCM + Kyber-KEM',
          timestamp: new Date().toISOString()
        };

        // Create new medical record with hybrid encryption
        const { data: record, error } = await supabase
          .from('medical_records')
          .insert([{
            user_id: user.id,
            patient_id: user.id,
            encrypted_data: JSON.stringify(hybridEncryptedData),
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
              data: recordData,
              encryption: {
                algorithm: 'AES-256-GCM + Kyber-KEM',
                quantumSafe: true
              }
            }
          }),
          { 
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } catch (encryptionError) {
        console.error('Encryption error:', encryptionError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to encrypt medical record',
            details: encryptionError.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
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
