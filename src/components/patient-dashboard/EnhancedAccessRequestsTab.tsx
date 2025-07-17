import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Calendar,
  FileText,
  Settings,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AutoApprovalRulesConfig from './AutoApprovalRulesConfig';
import EnhancedNotificationCenter from '@/components/patient/EnhancedNotificationCenter';
import NotificationSystemDashboard from '@/components/patient/NotificationSystemDashboard';

interface AccessRequest {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  status: string;
  urgency_level?: string;
  clinical_justification?: string;
  department?: string;
  expires_at?: string;
  responded_at?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

const EnhancedAccessRequestsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchAccessRequests();
    }
  }, [user]);

  const fetchAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          *,
          profiles:grantee_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as unknown as AccessRequest[]);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase.functions.invoke('respond_to_access_request', {
        body: {
          requestId,
          decision,
          notes: `Request ${decision} by patient`
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Access request ${decision} successfully`,
      });

      fetchAccessRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: `Failed to ${decision} request`,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string, urgency?: string) => {
    const urgencyColor = urgency === 'high' ? 'destructive' : urgency === 'medium' ? 'secondary' : 'outline';
    const statusColor = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
    
    return (
      <div className="flex gap-2">
        <Badge variant={statusColor}>
          {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
          {status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
          {status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        {urgency && (
          <Badge variant={urgencyColor}>
            {urgency === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
          </Badge>
        )}
      </div>
    );
  };

  const filterRequests = (status: string) => {
    switch (status) {
      case 'pending':
        return requests.filter(req => req.status === 'pending');
      case 'approved':
        return requests.filter(req => req.status === 'approved');
      case 'rejected':
        return requests.filter(req => req.status === 'rejected');
      default:
        return requests;
    }
  };

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const rejectedCount = requests.filter(req => req.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Settings className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system">
            <AlertTriangle className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingCount === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No pending access requests. All caught up!
              </AlertDescription>
            </Alert>
          ) : (
            filterRequests('pending').map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {request.profiles?.first_name} {request.profiles?.last_name}
                      </CardTitle>
                      <CardDescription>{request.profiles?.email}</CardDescription>
                    </div>
                    {getStatusBadge(request.status, request.urgency_level)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Permission Type:</span>
                      <p className="text-muted-foreground">{request.permission_type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>
                      <p className="text-muted-foreground">{request.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Requested:</span>
                      <p className="text-muted-foreground">{formatDistanceToNow(new Date(request.created_at))} ago</p>
                    </div>
                    {request.expires_at && (
                      <div>
                        <span className="font-medium">Expires:</span>
                        <p className="text-muted-foreground">{formatDistanceToNow(new Date(request.expires_at))}</p>
                      </div>
                    )}
                  </div>
                  
                  {request.clinical_justification && (
                    <div>
                      <span className="font-medium text-sm">Clinical Justification:</span>
                      <p className="text-sm text-muted-foreground mt-1">{request.clinical_justification}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleDecision(request.id, 'approved')}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDecision(request.id, 'rejected')}
                      disabled={processingId === request.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterRequests('approved').map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.profiles?.first_name} {request.profiles?.last_name}
                    </CardTitle>
                    <CardDescription>{request.profiles?.email}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Permission Type:</span>
                    <p className="text-muted-foreground">{request.permission_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Approved:</span>
                    <p className="text-muted-foreground">{formatDistanceToNow(new Date(request.responded_at || request.created_at))} ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterRequests('rejected').map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.profiles?.first_name} {request.profiles?.last_name}
                    </CardTitle>
                    <CardDescription>{request.profiles?.email}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Permission Type:</span>
                    <p className="text-muted-foreground">{request.permission_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Rejected:</span>
                    <p className="text-muted-foreground">{formatDistanceToNow(new Date(request.responded_at || request.created_at))} ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="automation">
          <AutoApprovalRulesConfig />
        </TabsContent>

        <TabsContent value="notifications">
          <EnhancedNotificationCenter />
        </TabsContent>

        <TabsContent value="system">
          <NotificationSystemDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAccessRequestsTab;