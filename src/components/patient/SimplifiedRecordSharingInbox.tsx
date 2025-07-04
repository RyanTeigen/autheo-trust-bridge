import React, { useState } from 'react';
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

// Mock data for better UX and consistent experience
const mockPendingRequests = [
  {
    id: '1',
    record_type: 'Lab Results - Blood Work', 
    provider_name: 'Dr. Sarah Johnson',
    provider_specialty: 'Internal Medicine',
    requested_at: '2024-12-20T10:30:00Z',
    permission_type: 'read' as const,
    expires_at: '2025-01-20T00:00:00Z',
    record_id: 'med_123'
  },
  {
    id: '2',
    record_type: 'Cardiac Stress Test Results',
    provider_name: 'Dr. Michael Chen', 
    provider_specialty: 'Cardiology',
    requested_at: '2024-12-18T14:15:00Z',
    permission_type: 'read' as const,
    expires_at: '2025-01-18T00:00:00Z',
    record_id: 'med_456'
  }
];

const mockApprovedRequests = [
  {
    id: '3',
    record_type: 'MRI Scan Results',
    provider_name: 'Dr. Emily Davis',
    provider_specialty: 'Radiology', 
    requested_at: '2024-12-15T09:00:00Z',
    approved_at: '2024-12-15T10:30:00Z',
    permission_type: 'read' as const,
    expires_at: '2025-01-15T00:00:00Z',
    record_id: 'med_789'
  }
];

const mockRejectedRequests = [
  {
    id: '4',
    record_type: 'Psychiatric Evaluation',
    provider_name: 'Dr. Robert Wilson',
    provider_specialty: 'Psychiatry',
    requested_at: '2024-12-10T16:20:00Z', 
    rejected_at: '2024-12-10T18:45:00Z',
    permission_type: 'read' as const,
    record_id: 'med_101'
  }
];

const SimplifiedRecordSharingInbox: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);
  const [approvedRequests, setApprovedRequests] = useState(mockApprovedRequests);
  const [rejectedRequests, setRejectedRequests] = useState(mockRejectedRequests);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleRequestResponse = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(requestId));

    // Simulate API delay
    setTimeout(() => {
      const request = pendingRequests.find(r => r.id === requestId);
      if (!request) return;

      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      // Add to appropriate list
      if (newStatus === 'approved') {
        setApprovedRequests(prev => [...prev, {
          ...request,
          approved_at: new Date().toISOString()
        }]);
      } else {
        setRejectedRequests(prev => [...prev, {
          ...request,
          rejected_at: new Date().toISOString()
        }]);
      }

      toast({
        title: newStatus === 'approved' ? "Request Approved" : "Request Denied",
        description: `The sharing request has been ${newStatus}.`,
      });

      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }, 800);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
              <span>Requested: {formatDate(request.requested_at)}</span>
            </div>
            {request.expires_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Expires: {new Date(request.expires_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {(request.approved_at || request.rejected_at) && (
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <CheckCircle className="h-4 w-4" />
              <span>
                {request.approved_at ? 'Approved' : 'Rejected'}: {formatDate(request.approved_at || request.rejected_at)}
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
            Record ID: {request.record_id}
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