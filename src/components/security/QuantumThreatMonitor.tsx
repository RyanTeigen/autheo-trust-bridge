import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

export default function QuantumThreatMonitor() {
  const [threatLevel, setThreatLevel] = useState<'low' | 'moderate' | 'high'>('low');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchThreatLevel = async () => {
    try {
      const { data, error } = await supabase
        .from('quantum_threat_monitor')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Failed to fetch threat level:', error);
        return;
      }

      if (data) {
        setThreatLevel(data.level as 'low' | 'moderate' | 'high');
        setLastUpdated(new Date(data.updated_at).toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching threat level:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatLevel();

    const interval = setInterval(fetchThreatLevel, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getThreatIcon = () => {
    switch (threatLevel) {
      case 'low':
        return <Shield className="h-5 w-5 text-success" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'high':
        return <Activity className="h-5 w-5 text-destructive" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getThreatColor = () => {
    switch (threatLevel) {
      case 'low':
        return 'text-success';
      case 'moderate':
        return 'text-warning';
      case 'high':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quantum Threat Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading threat level...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {getThreatIcon()}
          Quantum Threat Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Threat Level:</span>
            <span className={`text-sm font-semibold ${getThreatColor()}`}>
              {threatLevel.toUpperCase()}
            </span>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}