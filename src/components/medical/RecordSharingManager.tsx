
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSharingPermissionsAPI } from '@/hooks/useSharingPermissionsAPI';
import { useMedicalRecordsAPI } from '@/hooks/useMedicalRecordsAPI';
import { Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ShareRecordForm from './sharing/ShareRecordForm';
import SharingPermissionCard from './sharing/SharingPermissionCard';
import EmptySharingState from './sharing/EmptySharingState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DecryptedMedicalRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

interface SharingPermission {
  id: string;
  patient_id: string;
  grantee_id: string;
  medical_record_id: string;
  permission_type: 'read' | 'write';
  created_at: string;
  expires_at?: string;
}

const RecordSharingManager: React.FC = () => {
  const [records, setRecords] = useState<DecryptedMedicalRecord[]>([]);
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { getSharingPermissions, revokeSharingPermission } = useSharingPermissionsAPI();
  const { getRecords } = useMedicalRecordsAPI();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsResult, permissionsResult] = await Promise.all([
        getRecords({ limit: 50, offset: 0 }),
        getSharingPermissions({ limit: 50, offset: 0 })
      ]);

      if (recordsResult.success && recordsResult.data?.records) {
        const decryptedRecords = recordsResult.data.records.map((record: any) => ({
          id: record.id,
          patient_id: record.patient_id,
          data: JSON.parse(record.encrypted_data),
          record_type: record.record_type,
          created_at: record.created_at,
          updated_at: record.updated_at
        }));
        setRecords(decryptedRecords);
      }

      if (permissionsResult.success && permissionsResult.data?.permissions) {
        setPermissions(permissionsResult.data.permissions);
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

  const handleRevokePermission = async (permissionId: string) => {
    try {
      const result = await revokeSharingPermission(permissionId);

      if (result) {
        toast({
          title: "Success",
          description: "Sharing permission revoked",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: "Failed to revoke permission",
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

  const handleShareSuccess = () => {
    setIsShareDialogOpen(false);
    setSelectedRecordId('');
    fetchData();
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Share Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Medical Record</DialogTitle>
            </DialogHeader>
            
            {!selectedRecordId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="record-select">Select a record to share:</Label>
                  <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a record" />
                    </SelectTrigger>
                    <SelectContent>
                      {records.map((record) => (
                        <SelectItem key={record.id} value={record.id}>
                          {record.data.title || `${record.record_type} - ${new Date(record.created_at).toLocaleDateString()}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => selectedRecordId && setSelectedRecordId(selectedRecordId)}
                    disabled={!selectedRecordId}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsShareDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <ShareRecordForm
                recordId={selectedRecordId}
                recordTitle={selectedRecord?.data.title || `${selectedRecord?.record_type} record`}
                onSuccess={handleShareSuccess}
                onCancel={() => {
                  setSelectedRecordId('');
                  setIsShareDialogOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {permissions.length === 0 ? (
        <EmptySharingState onStartSharing={() => setIsShareDialogOpen(true)} />
      ) : (
        <div className="grid gap-4">
          {permissions.map((permission) => {
            const record = records.find(r => r.id === permission.medical_record_id);
            
            return (
              <SharingPermissionCard
                key={permission.id}
                permission={permission}
                record={record}
                onRevoke={handleRevokePermission}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecordSharingManager;
