import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientAccessLogViewer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.id) return;
      
      setLoading(true);

      // First get the patient record for the current user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError || !patientData) {
        toast({
          title: "Error",
          description: "Could not find patient record",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_access_logs_by_patient', {
        current_patient_id: patientData.id,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load access logs",
          variant: "destructive"
        });
      } else {
        setLogs(data || []);
      }

      setLoading(false);
    };

    fetchLogs();
  }, [user, toast]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Record Access History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <p className="text-muted-foreground text-sm">Loading access logs...</p>
        )}

        {!loading && logs.length === 0 && (
          <p className="text-muted-foreground text-sm">No access logs available.</p>
        )}

        {!loading && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm border border-border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left font-medium">Provider ID</th>
                  <th className="border-b border-border px-4 py-3 text-left font-medium">Action</th>
                  <th className="border-b border-border px-4 py-3 text-left font-medium">Record ID</th>
                  <th className="border-b border-border px-4 py-3 text-left font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="border-b border-border px-4 py-3 font-mono text-xs">
                      {log.provider_id?.substring(0, 8)}...
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <span className="capitalize">{log.action}</span>
                    </td>
                    <td className="border-b border-border px-4 py-3 font-mono text-xs">
                      {log.record_id?.substring(0, 8)}...
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {new Date(log.log_timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}