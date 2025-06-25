
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Shield, 
  AlertCircle,
  UserX
} from 'lucide-react';
import { SharedRecord } from './types';
import ShareRevocationDialog from './ShareRevocationDialog';

interface SharedRecordCardProps {
  record: SharedRecord;
  onRevokeAccess: (id: string) => void;
}

const SharedRecordCard: React.FC<SharedRecordCardProps> = ({ record, onRevokeAccess }) => {
  const [showRevocationDialog, setShowRevocationDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/20 text-green-400 border-green-700/30';
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30';
      case 'expired':
        return 'bg-red-900/20 text-red-400 border-red-700/30';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600/50';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'full access':
        return 'bg-blue-900/20 text-blue-400 border-blue-700/30';
      case 'limited access':
        return 'bg-purple-900/20 text-purple-400 border-purple-700/30';
      case 'read only':
        return 'bg-gray-900/20 text-gray-400 border-gray-700/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const handleRevocationComplete = () => {
    onRevokeAccess(record.id);
  };

  return (
    <>
      <Card className="bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-600/50 rounded-lg">
                  <User className="h-4 w-4 text-autheo-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-200">{record.recipientName}</h3>
                  <p className="text-sm text-slate-400 capitalize">{record.recipientType}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
                <Badge variant="outline" className={getAccessLevelColor(record.accessLevel)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {record.accessLevel}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Shared on {new Date(record.sharedDate).toLocaleDateString()}
                </div>
                {record.expiryDate && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Expires on {new Date(record.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              {record.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRevocationDialog(true)}
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Revoke
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareRevocationDialog
        open={showRevocationDialog}
        onOpenChange={setShowRevocationDialog}
        shareId={record.id}
        recipientName={record.recipientName}
        onRevocationComplete={handleRevocationComplete}
      />
    </>
  );
};

export default SharedRecordCard;
