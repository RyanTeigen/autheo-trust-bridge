
import React from 'react';
import { Badge } from '@/components/ui/badge';
import AccessRequestCard from './AccessRequestCard';

interface AccessRequest {
  id: string;
  patientName: string;
  patientId: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  requestType: 'full_access' | 'specific_records' | 'emergency_access';
  reason: string;
}

interface AccessRequestsListProps {
  title: string;
  requests: AccessRequest[];
  showActions?: boolean;
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
}

const AccessRequestsList: React.FC<AccessRequestsListProps> = ({
  title,
  requests,
  showActions = false,
  onApprove,
  onDeny
}) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
        <span>{title}</span>
        <Badge variant="secondary" className="bg-autheo-primary/20 text-autheo-primary">
          {requests.length}
        </Badge>
      </h4>
      <div className="space-y-4">
        {requests.map((request) => (
          <AccessRequestCard
            key={request.id}
            request={request}
            showActions={showActions}
            onApprove={onApprove}
            onDeny={onDeny}
          />
        ))}
      </div>
    </div>
  );
};

export default AccessRequestsList;
