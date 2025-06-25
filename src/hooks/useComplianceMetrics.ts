
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from './useAuditLog';

interface ComplianceMetrics {
  totalAuditLogs: number;
  errorRate: number;
  activeUsers: number;
  recentErrors: number;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  uniquePatients: number;
  uniqueProviders: number;
  recentAccessCount: number;
  recordSharesCount: number;
  soapNotesCount: number;
  medicalRecordsCount: number;
  accessDeniedCount: number;
  successfulLogins: number;
}

export const useComplianceMetrics = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalAuditLogs: 0,
    errorRate: 0,
    activeUsers: 0,
    recentErrors: 0,
    complianceScore: 92,
    riskLevel: 'low',
    uniquePatients: 0,
    uniqueProviders: 0,
    recentAccessCount: 0,
    recordSharesCount: 0,
    soapNotesCount: 0,
    medicalRecordsCount: 0,
    accessDeniedCount: 0,
    successfulLogins: 0
  });
  const [loading, setLoading] = useState(true);
  const { logAccess } = useAuditLog();

  const fetchComplianceMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch total audit logs
      const { count: totalLogs } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      // Fetch recent errors (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: errorCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'error')
        .gte('timestamp', yesterday.toISOString());

      // Fetch active users (users with recent activity)
      const { count: activeUserCount } = await supabase
        .from('audit_logs')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', yesterday.toISOString())
        .not('user_id', 'is', null);

      // Fetch unique patients count
      const { count: uniquePatientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Fetch unique providers count  
      const { count: uniqueProvidersCount } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true });

      // Fetch recent access count (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { count: recentAccessCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'ACCESS')
        .gte('timestamp', lastWeek.toISOString());

      // Fetch record shares count
      const { count: recordSharesCount } = await supabase
        .from('record_shares')
        .select('*', { count: 'exact', head: true });

      // Fetch SOAP notes count
      const { count: soapNotesCount } = await supabase
        .from('soap_notes')
        .select('*', { count: 'exact', head: true });

      // Fetch medical records count
      const { count: medicalRecordsCount } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true });

      // Fetch access denied count (last 30 days)
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      
      const { count: accessDeniedCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .ilike('details', '%denied%')
        .gte('timestamp', lastMonth.toISOString());

      // Fetch successful logins (last 7 days)
      const { count: successfulLogins } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'LOGIN')
        .eq('status', 'success')
        .gte('timestamp', lastWeek.toISOString());

      // Calculate error rate
      const errorRate = totalLogs && totalLogs > 0 ? ((errorCount || 0) / totalLogs) * 100 : 0;
      
      // Determine risk level based on error rate and access denied count
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (errorRate > 10 || (accessDeniedCount || 0) > 50) riskLevel = 'high';
      else if (errorRate > 5 || (accessDeniedCount || 0) > 20) riskLevel = 'medium';

      // Calculate compliance score based on metrics
      let complianceScore = 100;
      if (errorRate > 0) complianceScore -= Math.min(errorRate * 2, 20);
      if ((errorCount || 0) > 10) complianceScore -= 10;
      if ((accessDeniedCount || 0) > 20) complianceScore -= 15;
      
      setMetrics({
        totalAuditLogs: totalLogs || 0,
        errorRate: Math.round(errorRate * 100) / 100,
        activeUsers: activeUserCount || 0,
        recentErrors: errorCount || 0,
        complianceScore: Math.max(Math.round(complianceScore), 0),
        riskLevel,
        uniquePatients: uniquePatientsCount || 0,
        uniqueProviders: uniqueProvidersCount || 0,
        recentAccessCount: recentAccessCount || 0,
        recordSharesCount: recordSharesCount || 0,
        soapNotesCount: soapNotesCount || 0,
        medicalRecordsCount: medicalRecordsCount || 0,
        accessDeniedCount: accessDeniedCount || 0,
        successfulLogins: successfulLogins || 0
      });
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceMetrics();
    logAccess('compliance_overview', undefined, 'Accessed compliance overview dashboard');
  }, []);

  return { metrics, loading, refetchMetrics: fetchComplianceMetrics };
};
