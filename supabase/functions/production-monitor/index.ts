import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const alerts: SecurityAlert[] = [];

    // Monitor active sessions
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('enhanced_user_sessions')
      .select('*')
      .eq('is_active', true);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    } else {
      const activeSessions = sessions?.length || 0;
      
      if (activeSessions > 1000) {
        alerts.push({
          type: 'HIGH_SESSION_COUNT',
          severity: 'medium',
          message: `High number of active sessions detected: ${activeSessions}`,
          metadata: { count: activeSessions, threshold: 1000 }
        });
      }
    }

    // Monitor failed login attempts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: failedLogins, error: loginsError } = await supabaseClient
      .from('enhanced_audit_logs')
      .select('*')
      .eq('event_type', 'login_failed')
      .gte('created_at', oneDayAgo);

    if (loginsError) {
      console.error('Error fetching failed logins:', loginsError);
    } else {
      const failedLoginCount = failedLogins?.length || 0;
      
      if (failedLoginCount > 50) {
        alerts.push({
          type: 'HIGH_FAILED_LOGINS',
          severity: 'high',
          message: `High number of failed logins in 24h: ${failedLoginCount}`,
          metadata: { count: failedLoginCount, threshold: 50, period: '24h' }
        });
      }
    }

    // Monitor breach detection events
    const { data: breaches, error: breachError } = await supabaseClient
      .from('enhanced_breach_detection')
      .select('*')
      .eq('false_positive', false)
      .gte('detected_at', oneDayAgo);

    if (breachError) {
      console.error('Error fetching breaches:', breachError);
    } else {
      const breachCount = breaches?.length || 0;
      
      if (breachCount > 0) {
        alerts.push({
          type: 'SECURITY_BREACHES_DETECTED',
          severity: 'critical',
          message: `Security breach events detected: ${breachCount}`,
          metadata: { count: breachCount, breaches: breaches?.slice(0, 5) }
        });
      }
    }

    // Monitor expired OTPs (potential attack indicator)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: expiredOTPs, error: otpError } = await supabaseClient
      .from('otp_codes')
      .select('*')
      .lte('expires_at', new Date().toISOString())
      .gte('expires_at', oneHourAgo)
      .eq('is_used', false);

    if (otpError) {
      console.error('Error fetching expired OTPs:', otpError);
    } else {
      const expiredOTPCount = expiredOTPs?.length || 0;
      
      if (expiredOTPCount > 100) {
        alerts.push({
          type: 'HIGH_EXPIRED_OTP_COUNT',
          severity: 'medium',
          message: `High number of expired unused OTPs: ${expiredOTPCount}`,
          metadata: { count: expiredOTPCount, threshold: 100, period: '1h' }
        });
      }
    }

    // Log all alerts to audit system
    for (const alert of alerts) {
      await supabaseClient.rpc('log_security_event_secure', {
        event_type: alert.type,
        severity: alert.severity,
        description: alert.message,
        metadata: alert.metadata || {}
      });
    }

    // Cleanup expired sessions
    await supabaseClient.rpc('cleanup_expired_sessions_enhanced');

    // Return monitoring results
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      alerts_detected: alerts.length,
      alerts: alerts,
      checks_performed: [
        'active_sessions',
        'failed_logins',
        'breach_detection',
        'expired_otps',
        'session_cleanup'
      ],
      next_check: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Production monitoring error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Production monitoring failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})