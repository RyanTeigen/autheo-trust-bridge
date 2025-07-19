import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  appointmentId: string;
  decision: 'approve' | 'deny';
  note?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { appointmentId, decision, note }: RequestBody = await req.json();

    if (!appointmentId || !decision) {
      throw new Error("Missing required fields: appointmentId and decision");
    }

    if (!['approve', 'deny'].includes(decision)) {
      throw new Error("Decision must be 'approve' or 'deny'");
    }

    // Call the database function to process the appointment access request
    const { data, error } = await supabaseClient.rpc('respond_to_appointment_access_request', {
      appointment_id_param: appointmentId,
      decision_param: decision,
      note_param: note || null
    });

    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing appointment access request:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});