
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSharingPermissionsAPI } from '@/hooks/useSharingPermissionsAPI';
import { useMedicalRecordsAPI } from '@/hooks/useMedicalRecordsAPI';
import { useMedicalRecordsSharing } from '@/hooks/useMedicalRecordsSharing';
import { Shield, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ShareRecordForm from './sharing/ShareRecordForm';
import SharingPermissionCard from './sharing/SharingPermissionCard';
import EmptySharingState from './sharing/EmptySharingState';
import RecordShareManager from './sharing/RecordShareManager';
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

interface QuantumShare {
  id: string;
  record_id: string;
  shared_with_user_id: string;
  created_at: string;
  updated_at: string;
  medical_records?: {
    id: string;
    record_type: string;
    patient_id: string;
    patients: {
      full_name: string;
      email: string;
    };
  };
}

const RecordSharingManager: React.FC = () => {
  const [records, setRecords] = useState<DecryptedMedicalRecord[]>([]);
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);
  const [quantumShares, setQuantumShares] = useState<QuantumShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('legacy');
  const { toast } = useToast();
  
  const { getSharingPermissions, revokeSharingPermission } = useSharingPermissionsAPI();
  const { getRecords } = useMedicalRecordsAPI();
  const { getMyShares } = useMedicalRecordsSharing();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsResult, permissionsResult, quantumSharesResult] = await Promise.all([
        getRecords({ limit: 50, offset: 0 }),
        getSharingPermissions({ limit: 50, offset: 0 }),
        getMyShares()
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

      if (quantumSharesResult.success && quantumSharesResult.data?.permissions) {
        setQuantumShares(quantumSharesResult.data.permissions);
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
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Choose Sharing Method:</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('quantum')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quantum-Safe Sharing (Recommended)
                      <Badge variant="secondary" className="ml-auto">
                        <Shield className="h-3 w-3 mr-1" />
                        Post-Quantum
                      </Badge>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('legacy')}
                    >
                      Legacy Sharing
                    </Button>
                  </div>
                </div>

                {activeTab === 'quantum' ? (
                  <RecordShareManager
                    recordId={selectedRecordId}
                    recordTitle={selectedRecord?.data.title || `${selectedRecord?.record_type} record`}
                  />
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="legacy">
            Legacy Sharing ({permissions.length})
          </TabsTrigger>
          <TabsTrigger value="quantum" className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Quantum-Safe ({quantumShares.length})
            <Badge variant="secondary" className="ml-1">
              <Shield className="h-2 w-2 mr-1" />
              New
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="legacy" className="mt-6">
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
        </TabsContent>

        <TabsContent value="quantum" className="mt-6">
          <RecordShareManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordSharingManager;
