
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Trash2, Clock, User, Eye, Share2 } from 'lucide-react';

interface QuantumShare {
  id: string;
  record_id: string;
  shared_with_user_id: string;
  created_at: string;
  updated_at: string;
  pq_encrypted_key?: string;
  medical_records?: {
    id: string;
    record_type: string;
    patient_id: string;
    created_at?: string;
    patients?: {
      full_name?: string;
      email?: string;
      user_id?: string;
    };
  };
}

interface SharesListProps {
  title: string;
  shares: QuantumShare[];
  icon: React.ComponentType<{ className?: string }>;
  emptyMessage: string;
  showRevokeButton?: boolean;
  onRevoke?: (shareId: string) => void;
  loading?: boolean;
}

const SharesList: React.FC<SharesListProps> = ({
  title,
  shares,
  icon: Icon,
  emptyMessage,
  showRevokeButton = false,
  onRevoke,
  loading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-slate-200">{title}</h3>
      {shares.length === 0 ? (
        <Alert>
          <Icon className="h-4 w-4" />
          <AlertDescription>{emptyMessage}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          {shares.map((share) => (
            <div key={share.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Record ID: {share.record_id}</p>
                <p className="text-xs text-slate-400">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Shared: {formatDate(share.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Quantum-Safe
                </Badge>
                {showRevokeButton && onRevoke && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRevoke(share.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharesList;
