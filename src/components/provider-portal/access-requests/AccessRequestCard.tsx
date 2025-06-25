
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AccessRequest {
  id: string;
  patientName: string;
  patientId: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  requestType: 'full_access' | 'specific_records' | 'emergency_access';
  reason: string;
}

interface AccessRequestCardProps {
  request: AccessRequest;
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
  showActions?: boolean;
}

const AccessRequestCard: React.FC<AccessRequestCardProps> = ({
  request,
  onApprove,
  onDeny,
  showActions = false
}) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${!showActions ? 'opacity-75' : ''}`}>
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
          {showActions && onApprove && onDeny && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onApprove(request.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeny(request.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Deny
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessRequestCard;
