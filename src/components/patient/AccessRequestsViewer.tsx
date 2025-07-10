import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Clock, CheckCircle2, XCircle, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AccessRequest {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  permission_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  responded_at: string | null;
  expires_at: string | null;
  decision_note: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  medical_records?: {
    record_type: string;
  } | null;
}

const AccessRequestsViewer: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAccessRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('get_patient_access_requests');

      if (error) throw error;

      if (data?.success) {
        setRequests(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch access requests');
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load access requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessRequests();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
              <Eye className="h-6 w-6 text-autheo-dark" />
            </div>
            <div>
              <CardTitle className="text-autheo-primary">Access Request History</CardTitle>
              <CardDescription className="text-slate-300">
                View all access requests for your medical records
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={fetchAccessRequests}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No access requests found</p>
            <p className="text-sm">Access requests will appear here when providers request access to your records</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-slate-700 rounded-lg border border-slate-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className="font-medium text-slate-200">
                      {request.profiles 
                        ? `${request.profiles.first_name} ${request.profiles.last_name}`
                        : 'Unknown Provider'
                      }
                    </span>
                  </div>
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
                  <div>
                    <span className="font-medium">Provider Email:</span>
                    <span className="ml-2 text-slate-300">
                      {request.profiles?.email || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Record Type:</span>
                    <span className="ml-2 text-slate-300">
                      {request.medical_records?.record_type || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Permission:</span>
                    <span className="ml-2 text-slate-300 capitalize">
                      {request.permission_type}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Requested:</span>
                    <span className="ml-2 text-slate-300">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {request.responded_at && (
                    <div>
                      <span className="font-medium">Responded:</span>
                      <span className="ml-2 text-slate-300">
                        {new Date(request.responded_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {request.expires_at && (
                    <div>
                      <span className="font-medium">Expires:</span>
                      <span className="ml-2 text-slate-300">
                        {new Date(request.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {request.decision_note && (
                  <div className="mt-3 p-3 bg-slate-600 rounded">
                    <span className="text-sm font-medium text-slate-300">Note:</span>
                    <p className="text-sm text-slate-400 mt-1">{request.decision_note}</p>
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

export default AccessRequestsViewer;