
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AccessRequestsList from './access-requests/AccessRequestsList';

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

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-200 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-autheo-primary" />
            Pending Access Requests
          </h3>
          <p className="text-slate-400 mt-1">
            Review and respond to patient record access requests. Approved requests will appear in your notifications.
          </p>
        </div>
        <Badge variant="secondary" className="bg-autheo-primary/20 text-autheo-primary">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      {pendingRequests.length === 0 ? (
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>
            No pending access requests. New requests will appear here when patients share their records or when emergency access is needed.
          </AlertDescription>
        </Alert>
      ) : (
        <AccessRequestsList
          title={`Pending Requests (${pendingRequests.length})`}
          requests={pendingRequests}
          showActions={true}
          onApprove={handleApproveRequest}
          onDeny={handleDenyRequest}
        />
      )}
    </div>
  );
};

export default AccessRequestsTab;
