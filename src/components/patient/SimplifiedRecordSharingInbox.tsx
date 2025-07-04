import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SharingPermission {
  id: string;
  medical_record_id: string;
  patient_id: string;
  grantee_id: string;
  permission_type: 'read' | 'write';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  expires_at?: string;
  responded_at?: string;
  record_type?: string;
  provider_name?: string;
  provider_specialty?: string;
}

const SimplifiedRecordSharingInbox: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<SharingPermission[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<SharingPermission[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<SharingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchSharingRequests();
    }
  }, [user?.id]);

  const fetchSharingRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch all sharing permissions for the current user
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          medical_record_id,
          patient_id,
          grantee_id,
          permission_type,
          status,
          created_at,
          expires_at,
          responded_at,
          medical_records!inner(
            record_type,
            provider_id
          )
        `)
        .eq('grantee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get provider information for each request
      const requestsWithProviders = await Promise.all(
        (data || []).map(async (request) => {
          const providerId = (request.medical_records as any)?.provider_id;
          let providerInfo = null;

          if (providerId) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, role')
              .eq('id', providerId)
              .single();

            if (profileData) {
              providerInfo = {
                name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Healthcare Provider',
                specialty: profileData.role === 'provider' ? 'Healthcare Provider' : 'Medical Professional'
              };
            }
          }

          return {
            ...request,
            record_type: (request.medical_records as any)?.record_type || 'Medical Record',
            provider_name: providerInfo?.name || 'Healthcare Provider',
            provider_specialty: providerInfo?.specialty || 'Medical Professional'
          } as SharingPermission;
        })
      );

      // Separate requests by status
      const pending = requestsWithProviders.filter(r => r.status === 'pending');
      const approved = requestsWithProviders.filter(r => r.status === 'approved');
      const rejected = requestsWithProviders.filter(r => r.status === 'rejected');

      setPendingRequests(pending);
      setApprovedRequests(approved);
      setRejectedRequests(rejected);

    } catch (err) {
      console.error('Error fetching sharing requests:', err);
      toast({
        title: "Error",
        description: "Failed to load sharing requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(requestId));

    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('respond_to_access_request', {
        body: {
          request_id: requestId,
          status: newStatus
        }
      });

      if (error) throw error;

      toast({
        title: newStatus === 'approved' ? "Request Approved" : "Request Denied",
        description: data.message || `The sharing request has been ${newStatus}.`,
      });

      // Refresh the requests list
      await fetchSharingRequests();

    } catch (err) {
      console.error('Error updating sharing request:', err);
      toast({
        title: "Error",
        description: `Failed to ${newStatus === 'approved' ? 'approve' : 'deny'} the request`,
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const renderRequestCard = (
    request: any, 
    showActions: boolean = true,
    statusBadgeColor: string = "bg-amber-900/20 text-amber-400 border-amber-800"
  ) => (
    <Card key={request.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-slate-200 text-lg">{request.record_type}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {request.provider_name} • {request.provider_specialty}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={statusBadgeColor}>
              {showActions ? 'Pending' : (request.approved_at ? 'Approved' : 'Rejected')}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {request.permission_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Requested: {formatDate(request.created_at)}</span>
            </div>
            {request.expires_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Expires: {new Date(request.expires_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {(request.responded_at) && (
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <CheckCircle className="h-4 w-4" />
              <span>
                Responded: {formatDate(request.responded_at)}
              </span>
            </div>
          )}

          {showActions && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="autheo"
                onClick={() => handleRequestResponse(request.id, 'approved')}
                disabled={processingIds.has(request.id)}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                {processingIds.has(request.id) ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRequestResponse(request.id, 'rejected')}
                disabled={processingIds.has(request.id)}
                className="flex items-center gap-1 text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <XCircle className="h-4 w-4" />
                {processingIds.has(request.id) ? 'Processing...' : 'Deny'}
              </Button>
            </div>
          )}

          <div className="text-xs text-slate-500">
            Record ID: {request.medical_record_id.slice(0, 8)}...
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Access Requests</h2>
          <p className="text-slate-400">Manage record access requests from healthcare providers</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="bg-amber-900/20 text-amber-400 border-amber-800">
              {pendingRequests.length} Pending
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="pending" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4">
            {pendingRequests.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Share2 className="h-16 w-16 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Pending Requests</h3>
                  <p className="text-slate-400">
                    You don't have any pending access requests from healthcare providers.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map(request => renderRequestCard(request, true))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <div className="grid gap-4">
            {approvedRequests.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Approved Requests</h3>
                  <p className="text-slate-400">
                    Your approved access requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map(request => renderRequestCard(
                request, 
                false, 
                "bg-green-900/20 text-green-400 border-green-800"
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <div className="grid gap-4">
            {rejectedRequests.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Rejected Requests</h3>
                  <p className="text-slate-400">
                    Your rejected access requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              rejectedRequests.map(request => renderRequestCard(
                request, 
                false, 
                "bg-red-900/20 text-red-400 border-red-800"
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplifiedRecordSharingInbox;