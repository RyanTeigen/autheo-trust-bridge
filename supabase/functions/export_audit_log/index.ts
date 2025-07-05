import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    // Initialize Supabase client with service role for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user has compliance/admin role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the current user to verify permissions
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user }, error: userError } = await userSupabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['compliance', 'admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Exporting audit logs for compliance user: ${user.id}`)

    // Fetch all audit logs ordered by timestamp
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch audit logs' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create CSV content for the audit logs
    const headers = ['timestamp', 'user_id', 'action', 'resource', 'status', 'ip_address', 'details']
    const csvRows = [headers.join(',')]
    
    const logString = logs.map(log => {
      const row = [
        log.timestamp || '',
        log.user_id || '',
        log.action || '',
        log.resource || '',
        log.status || '',
        log.ip_address || '',
        (log.details || '').replace(/"/g, '""') // Escape quotes in CSV
      ]
      return row.map(field => `"${field}"`).join(',')
    }).join('\n')

    csvRows.push(logString)
    const csvContent = csvRows.join('\n')

    // Create SHA-256 hash of the audit logs for integrity verification
    const encoder = new TextEncoder()
    const data = encoder.encode(logString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const exportTimestamp = new Date().toISOString()

    // Log this export action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'EXPORT_AUDIT_LOGS',
      resource: 'audit_logs',
      status: 'success',
      details: `Exported ${logs.length} audit log entries with hash verification`,
      metadata: {
        export_format: 'csv',
        records_count: logs.length,
        hash_sha256: hash,
        timestamp: exportTimestamp
      }
    })

    console.log(`Successfully exported ${logs.length} audit logs for user ${user.id}`)

    return new Response(csvContent, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${exportTimestamp.replace(/[:.]/g, '-')}.csv"`,
        'X-Audit-Hash': hash,
        'X-Export-Timestamp': exportTimestamp,
        'X-Total-Records': logs.length.toString()
      }
    })

  } catch (error) {
    console.error('Unexpected error in export_audit_log:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})