
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, User, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RevokedShare {
  id: string;
  record_id: string;
  revoked_by: string;
  revoked_at: string;
  reason?: string;
}

const RevokedSharesList: React.FC = () => {
  const [revocations, setRevocations] = useState<RevokedShare[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRevocations = async () => {
      try {
        const { data, error } = await supabase
          .from('revoked_shares')
          .select('id, record_id, revoked_by, revoked_at, reason')
          .order('revoked_at', { ascending: false });

        if (error) {
          throw error;
        }

        setRevocations(data || []);
      } catch (error) {
        console.error('Failed to fetch revoked shares:', error);
        toast({
          title: "Failed to Load Revocations",
          description: "Could not fetch revoked shares data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRevocations();
  }, [toast]);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Revoked Shares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-slate-400">Loading revoked shares...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Revoked Shares
          <Badge variant="outline" className="ml-auto text-red-400 border-red-400">
            {revocations.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {revocations.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No Revoked Shares</p>
            <p className="text-sm text-slate-500">
              All record shares are currently active
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {revocations.map((revocation) => (
              <div
                key={revocation.id}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-400" />
                    <span className="font-medium text-slate-200 text-sm">
                      Record ID: {revocation.record_id.substring(0, 8)}...
                    </span>
                  </div>
                  <Badge variant="outline" className="text-red-400 border-red-400/50 text-xs">
                    Revoked
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-500">Revoked by:</span>
                    <span>{revocation.revoked_by.substring(0, 8)}...</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-500">Revoked at:</span>
                    <span>{new Date(revocation.revoked_at).toLocaleString()}</span>
                  </div>
                </div>

                {revocation.reason && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-600/50">
                    <p className="text-xs text-slate-500 mb-1">Reason:</p>
                    <p className="text-sm text-slate-300">{revocation.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevokedSharesList;
