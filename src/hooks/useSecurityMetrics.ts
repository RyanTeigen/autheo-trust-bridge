import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityMonitoring } from '@/services/security/SecurityMonitoringService';

interface SecurityMetrics {
  activeSessions: number;
  securityEvents: number;
  criticalEvents: number;
  complianceScore: number;
  lastAudit: string;
  failedLogins: number;
  lastThreatDetected?: string;
}

export const useSecurityMetrics = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeSessions: 0,
    securityEvents: 0,
    criticalEvents: 0,
    complianceScore: 85,
    lastAudit: 'Loading...',
    failedLogins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch active sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('is_active', true);

      if (sessionsError) {
        console.warn('Error fetching sessions:', sessionsError);
      }

      // Fetch audit logs for failed logins in last 24 hours
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'LOGIN_ATTEMPT')
        .eq('status', 'failed')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (auditError) {
        console.warn('Error fetching audit logs:', auditError);
      }

      // Fetch breach detection events
      const { data: breachEvents, error: breachError } = await supabase
        .from('breach_detection_events')
        .select('*')
        .eq('resolved', false);

      if (breachError) {
        console.warn('Error fetching breach events:', breachError);
      }

      // Fetch latest audit timestamp
      const { data: latestAudit, error: latestAuditError } = await supabase
        .from('audit_logs')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (latestAuditError) {
        console.warn('Error fetching latest audit:', latestAuditError);
      }

      // Get security monitoring service data
      const securityServiceMetrics = await securityMonitoring.getSecurityMetrics();
      const storedThreats = securityMonitoring.getStoredThreats();

      // Calculate compliance score based on multiple factors
      const baseScore = 100;
      const criticalEvents = (breachEvents?.filter(e => e.severity === 'critical').length || 0) + 
                           storedThreats.filter(t => t.severity === 'critical').length;
      const highEvents = (breachEvents?.filter(e => e.severity === 'high').length || 0) + 
                        storedThreats.filter(t => t.severity === 'high').length;
      
      const complianceScore = Math.max(0, baseScore - (criticalEvents * 15) - (highEvents * 5));

      // Format last audit date
      const lastAuditDate = latestAudit?.[0]?.timestamp 
        ? new Date(latestAudit[0].timestamp).toLocaleDateString()
        : 'No audits found';

      setMetrics({
        activeSessions: sessions?.length || 0,
        securityEvents: (breachEvents?.length || 0) + storedThreats.length,
        criticalEvents,
        complianceScore: Math.round(complianceScore),
        lastAudit: lastAuditDate,
        failedLogins: auditLogs?.length || 0,
        lastThreatDetected: storedThreats[0]?.detectedAt || breachEvents?.[0]?.created_at,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching security metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch security metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Set up real-time subscription for sessions
    const sessionsChannel = supabase
      .channel('sessions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_sessions' },
        () => fetchMetrics()
      )
      .subscribe();

    // Set up real-time subscription for breach events
    const breachChannel = supabase
      .channel('breach_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'breach_detection_events' },
        () => fetchMetrics()
      )
      .subscribe();

    // Set up real-time subscription for audit logs
    const auditChannel = supabase
      .channel('audit_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'audit_logs' },
        () => fetchMetrics()
      )
      .subscribe();

    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(breachChannel);
      supabase.removeChannel(auditChannel);
      clearInterval(interval);
    };
  }, []);

  return { metrics, loading, error, refetch: fetchMetrics };
};