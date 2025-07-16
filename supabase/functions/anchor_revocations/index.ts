import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('Starting revocation event anchoring process...')

    // Fetch unanchored revocation events
    const { data: revocationEvents, error: fetchError } = await supabase
      .from('revocation_events')
      .select('*')
      .eq('anchored', false)
      .limit(10) // Process in batches

    if (fetchError) {
      console.error('Failed to fetch revocation events:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch revocation events' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!revocationEvents || revocationEvents.length === 0) {
      console.log('No unanchored revocation events found')
      return new Response(
        JSON.stringify({ message: 'No revocation events to anchor' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Found ${revocationEvents.length} revocation events to anchor`)

    const results = []

    for (const event of revocationEvents) {
      try {
        console.log(`Processing revocation event ${event.id}`)

        // For now, we'll add these to the hash_anchor_queue 
        // The existing anchor queue processor will handle blockchain submission
        const { error: queueError } = await supabase
          .from('hash_anchor_queue')
          .insert({
            hash: event.event_hash,
            record_id: event.record_id,
            patient_id: event.patient_id,
            provider_id: event.provider_id,
            anchor_status: 'pending',
            queued_at: new Date().toISOString()
          })

        if (queueError) {
          console.error(`Failed to queue revocation event ${event.id}:`, queueError)
          results.push({ 
            event_id: event.id, 
            status: 'failed', 
            error: queueError.message 
          })
          continue
        }

        // Mark the revocation event as anchored (queued for anchoring)
        const { error: updateError } = await supabase
          .from('revocation_events')
          .update({
            anchored: true,
            anchored_at: new Date().toISOString()
          })
          .eq('id', event.id)

        if (updateError) {
          console.error(`Failed to update revocation event ${event.id}:`, updateError)
          results.push({ 
            event_id: event.id, 
            status: 'queued_but_update_failed', 
            error: updateError.message 
          })
        } else {
          console.log(`Successfully queued revocation event ${event.id} for anchoring`)
          results.push({ 
            event_id: event.id, 
            status: 'queued_for_anchoring',
            hash: event.event_hash
          })
        }

      } catch (eventError) {
        console.error(`Error processing revocation event ${event.id}:`, eventError)
        results.push({ 
          event_id: event.id, 
          status: 'error', 
          error: eventError.message 
        })
      }
    }

    // Log the anchoring batch to audit logs
    await supabase
      .from('audit_logs')
      .insert({
        action: 'ANCHOR_REVOCATION_EVENTS',
        resource: 'revocation_events',
        status: 'success',
        details: `Processed ${revocationEvents.length} revocation events for blockchain anchoring`,
        metadata: { results },
        timestamp: new Date().toISOString()
      })

    console.log(`Revocation anchoring completed. Processed ${revocationEvents.length} events.`)

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: revocationEvents.length,
        results
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Revocation anchoring error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})