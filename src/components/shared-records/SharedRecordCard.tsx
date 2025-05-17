import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share, Clock, Lock } from 'lucide-react';
import { SharedRecord } from './types';

interface SharedRecordCardProps {
  record: SharedRecord;
  onRevokeAccess: (id: string) => void;
}

const SharedRecordCard: React.FC<SharedRecordCardProps> = ({ record, onRevokeAccess }) => {
  // Function to get badge color based on access level
  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'limited':
        return 'bg-amber-100 text-amber-800';
      case 'read-only':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{record.recipientName}</CardTitle>
            <CardDescription>
              {record.recipientType.charAt(0).toUpperCase() + record.recipientType.slice(1)}
            </CardDescription>
          </div>
          <Badge variant="outline" className={getAccessLevelBadge(record.accessLevel)}>
            {record.accessLevel.charAt(0).toUpperCase() + record.accessLevel.slice(1)} Access
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Share className="h-4 w-4 text-muted-foreground" />
            <span>Shared on {new Date(record.sharedDate).toLocaleDateString()}</span>
          </div>
          {record.expiryDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Expires on {new Date(record.expiryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          {record.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600" 
              onClick={() => onRevokeAccess(record.id)}
            >
              <Lock className="h-4 w-4 mr-1" />
              Revoke Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedRecordCard;
