
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SharingPermission } from '@/types/medical';
import { DecryptedMedicalRecord } from '@/types/medical';
import { User, Clock, Trash2 } from 'lucide-react';

interface SharingPermissionCardProps {
  permission: SharingPermission;
  record?: DecryptedMedicalRecord;
  onRevoke: (permissionId: string) => void;
}

const SharingPermissionCard: React.FC<SharingPermissionCardProps> = ({
  permission,
  record,
  onRevoke
}) => {
  const getPermissionTypeColor = (type: string) => {
    return type === 'write' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const isPermissionExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpired = isPermissionExpired(permission.expires_at);

  return (
    <Card className={isExpired ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {record?.data?.title || 'Untitled Record'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getPermissionTypeColor(permission.permission_type)}>
                {permission.permission_type}
              </Badge>
              <Badge variant="outline">
                {record?.record_type || 'unknown'}
              </Badge>
              {isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(permission.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Shared with:</strong> {permission.grantee_id}
          </div>
          <div>
            <strong>Shared on:</strong> {new Date(permission.created_at).toLocaleDateString()}
          </div>
          {permission.expires_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <strong>Expires:</strong> {new Date(permission.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SharingPermissionCard;
