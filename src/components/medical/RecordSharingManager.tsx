
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PatientRecordsService } from '@/services/PatientRecordsService';
import { MedicalRecordsService, DecryptedMedicalRecord } from '@/services/MedicalRecordsService';
import { SharingPermission } from '@/types/medical';
import { Share2, Trash2, Clock, Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const RecordSharingManager: React.FC = () => {
  const [records, setRecords] = useState<DecryptedMedicalRecord[]>([]);
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [shareForm, setShareForm] = useState({
    granteeId: '',
    permissionType: 'read' as 'read' | 'write',
    expiresAt: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsResult, permissionsResult] = await Promise.all([
        MedicalRecordsService.getRecords(),
        PatientRecordsService.getSharingPermissions()
      ]);

      if (recordsResult.success && recordsResult.records) {
        setRecords(recordsResult.records);
      }

      if (permissionsResult.success && permissionsResult.permissions) {
        setPermissions(permissionsResult.permissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch records and sharing permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareRecord = async () => {
    if (!selectedRecordId || !shareForm.granteeId) {
      toast({
        title: "Error",
        description: "Please select a record and enter a provider ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await PatientRecordsService.shareRecordWithProvider(
        selectedRecordId,
        shareForm.granteeId,
        shareForm.permissionType,
        shareForm.expiresAt || undefined
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "Record shared successfully",
        });
        setIsShareDialogOpen(false);
        setShareForm({ granteeId: '', permissionType: 'read', expiresAt: '' });
        setSelectedRecordId('');
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to share record",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share record",
        variant: "destructive",
      });
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      const result = await PatientRecordsService.revokeSharingPermission(permissionId);

      if (result.success) {
        toast({
          title: "Success",
          description: "Sharing permission revoked",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to revoke permission",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke sharing permission",
        variant: "destructive",
      });
    }
  };

  const getPermissionTypeColor = (type: string) => {
    return type === 'write' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const isPermissionExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading sharing permissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Record Sharing Management</h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4" />
            Manage who has access to your medical records
          </p>
        </div>
        
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Medical Record</DialogTitle>
              <DialogDescription>
                Grant access to one of your medical records to a healthcare provider.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Record</label>
                <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a record to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {records.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.data?.title || 'Untitled Record'} ({record.record_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Provider ID</label>
                <Input
                  value={shareForm.granteeId}
                  onChange={(e) => setShareForm(prev => ({ ...prev, granteeId: e.target.value }))}
                  placeholder="Enter provider user ID"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Permission Type</label>
                <Select 
                  value={shareForm.permissionType} 
                  onValueChange={(value: 'read' | 'write') => setShareForm(prev => ({ ...prev, permissionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Read & Write</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Expires At (Optional)</label>
                <Input
                  type="datetime-local"
                  value={shareForm.expiresAt}
                  onChange={(e) => setShareForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleShareRecord} className="flex-1">
                  Share Record
                </Button>
                <Button variant="outline" onClick={() => setIsShareDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {permissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Share2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared records</h3>
            <p className="text-gray-600 text-center mb-4">
              You haven't shared any medical records with healthcare providers yet.
            </p>
            <Button onClick={() => setIsShareDialogOpen(true)} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Your First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {permissions.map((permission) => {
            const record = records.find(r => r.id === permission.medical_record_id);
            const isExpired = isPermissionExpired(permission.expires_at);
            
            return (
              <Card key={permission.id} className={isExpired ? 'opacity-60' : ''}>
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
                      onClick={() => handleRevokePermission(permission.id)}
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
          })}
        </div>
      )}
    </div>
  );
};

export default RecordSharingManager;
