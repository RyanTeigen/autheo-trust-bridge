
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessRequest {
  id: string;
  patientName: string;
  patientId: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  requestType: 'full_access' | 'specific_records' | 'emergency_access';
  reason: string;
}

// Mock data for demonstration
const mockAccessRequests: AccessRequest[] = [
  {
    id: '1',
    patientName: 'John Smith',
    patientId: 'PAT001',
    requestedAt: '2025-01-15T10:30:00Z',
    status: 'pending',
    requestType: 'full_access',
    reason: 'Routine checkup and ongoing care management'
  },
  {
    id: '2',
    patientName: 'Maria Garcia',
    patientId: 'PAT002',
    requestedAt: '2025-01-14T14:15:00Z',
    status: 'approved',
    requestType: 'specific_records',
    reason: 'Review lab results for diabetes management'
  },
  {
    id: '3',
    patientName: 'Robert Johnson',
    patientId: 'PAT003',
    requestedAt: '2025-01-13T09:45:00Z',
    status: 'denied',
    requestType: 'emergency_access',
    reason: 'Emergency consultation - chest pain evaluation'
  }
];

const AccessRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>(mockAccessRequests);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'denied':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' as const } : req
      )
    );
    
    toast({
      title: "Access Request Approved",
      description: "Patient access has been granted successfully.",
    });
  };

  const handleDenyRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'denied' as const } : req
      )
    );
    
    toast({
      title: "Access Request Denied",
      description: "Patient access request has been denied.",
      variant: "destructive",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-200 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-autheo-primary" />
            Patient Access Requests
          </h3>
          <p className="text-slate-400 mt-1">
            Manage patient record access requests and permissions
          </p>
        </div>
        <Badge variant="secondary" className="bg-autheo-primary/20 text-autheo-primary">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      {pendingRequests.length === 0 && processedRequests.length === 0 ? (
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>
            No access requests found. Requests will appear here when patients share their records or when emergency access is needed.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-300 border-b border-slate-700 pb-2">
                Pending Requests ({pendingRequests.length})
              </h4>
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-200 flex items-center">
                        {getStatusIcon(request.status)}
                        <span className="ml-2">{request.patientName}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      Patient ID: {request.patientId} • Requested: {formatDate(request.requestedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-300">Request Type:</p>
                        <p className="text-sm text-slate-400 capitalize">{request.requestType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Reason:</p>
                        <p className="text-sm text-slate-400">{request.reason}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDenyRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Processed Requests */}
          {processedRequests.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-300 border-b border-slate-700 pb-2">
                Recent Decisions ({processedRequests.length})
              </h4>
              {processedRequests.map((request) => (
                <Card key={request.id} className="bg-slate-800 border-slate-700 opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-200 flex items-center">
                        {getStatusIcon(request.status)}
                        <span className="ml-2">{request.patientName}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      Patient ID: {request.patientId} • Requested: {formatDate(request.requestedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-slate-300">Request Type:</p>
                        <p className="text-sm text-slate-400 capitalize">{request.requestType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Reason:</p>
                        <p className="text-sm text-slate-400">{request.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccessRequestsTab;
