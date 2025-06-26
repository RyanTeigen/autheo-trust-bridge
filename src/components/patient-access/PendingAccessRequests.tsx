
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePendingAccessRequests } from '@/hooks/usePendingAccessRequests';
import { useAccessRequestResponse } from '@/hooks/useAccessRequestResponse';
import { UserCheck, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

const PendingAccessRequests: React.FC = () => {
  const { requests, loading, refetch } = usePendingAccessRequests();
  const { respondToAccessRequest, loading: responding } = useAccessRequestResponse();

  const handleApprove = async (requestId: string) => {
    const result = await respondToAccessRequest({
      requestId,
      action: 'approve'
    });
    
    if (result.success) {
      refetch();
    }
  };

  const handleReject = async (requestId: string) => {
    const result = await respondToAccessRequest({
      requestId,
      action: 'reject'
    });
    
    if (result.success) {
      refetch();
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Pending Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-autheo-primary" />
          Provider Access Requests
        </h2>
        <p className="text-slate-400">
          Review and respond to healthcare provider requests to access your medical records.
        </p>
      </div>

      <Alert className="border-amber-500/30 bg-amber-900/20">
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-slate-200">
          <strong>Your Privacy Matters:</strong> You have full control over who can access your medical records. 
          You can approve or deny any request, and revoke access at any time.
        </AlertDescription>
      </Alert>

      {requests.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Pending Requests</p>
              <p className="text-sm">You don't have any pending access requests at this time.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-100 text-lg">
                      Access Request from {request.provider_name}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {request.provider_email}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Record Type:</span>
                    <div className="text-slate-200 font-medium">{request.record_type}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Permission Type:</span>
                    <div className="text-slate-200 font-medium capitalize">{request.permission_type}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Requested:</span>
                    <div className="text-slate-200 font-medium">
                      {new Date(request.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    disabled={responding}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Access
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={responding}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingAccessRequests;
