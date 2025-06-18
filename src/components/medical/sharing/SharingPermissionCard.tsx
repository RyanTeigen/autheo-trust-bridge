
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, Clock, Trash2 } from 'lucide-react';

interface SharingPermission {
  id: string;
  patient_id: string;
  grantee_id: string;
  medical_record_id: string;
  permission_type: 'read' | 'write';
  created_at: string;
  expires_at?: string;
}

interface DecryptedMedicalRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

interface SharingPermissionCardProps {
  permission: SharingPermission;
  record?: DecryptedMedicalRecord;
  onRevoke: (permissionId: string) => Promise<void>;
}

const SharingPermissionCard: React.FC<SharingPermissionCardProps> = ({
  permission,
  record,
  onRevoke
}) => {
  const isExpired = permission.expires_at && new Date(permission.expires_at) < new Date();
  
  const handleRevoke = () => {
    onRevoke(permission.id);
  };

  return (
    <Card className={`${isExpired ? 'opacity-60 border-gray-300' : 'border-green-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">
              {record?.data.title || `${record?.record_type || 'Medical Record'}`}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={permission.permission_type === 'write' ? 'default' : 'secondary'}>
              {permission.permission_type}
            </Badge>
            <Badge variant={isExpired ? 'destructive' : 'outline'}>
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCheck className="h-4 w-4" />
            <span>Shared with: {permission.grantee_id}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Granted: {new Date(permission.created_at).toLocaleDateString()}
              {permission.expires_at && (
                <span> | Expires: {new Date(permission.expires_at).toLocaleDateString()}</span>
              )}
            </span>
          </div>

          {record && (
            <div className="text-sm text-gray-500">
              <span className="capitalize">{record.record_type}</span> record
              {record.data.description && (
                <p className="mt-1 line-clamp-2">{record.data.description}</p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevoke}
              disabled={isExpired}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Revoke Access
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharingPermissionCard;
