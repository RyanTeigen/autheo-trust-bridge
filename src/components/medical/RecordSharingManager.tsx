
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSharingPermissionsAPI } from '@/hooks/useSharingPermissionsAPI';
import { useMedicalRecordsAPI } from '@/hooks/useMedicalRecordsAPI';
import { Shield } from 'lucide-react';
import ShareRecordDialog from './sharing/ShareRecordDialog';
import SharingPermissionCard from './sharing/SharingPermissionCard';
import EmptySharingState from './sharing/EmptySharingState';

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

interface ShareForm {
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt: string;
}

const RecordSharingManager: React.FC = () => {
  const [records, setRecords] = useState<DecryptedMedicalRecord[]>([]);
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { getSharingPermissions, createSharingPermission, revokeSharingPermission } = useSharingPermissionsAPI();
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

  const handleShareRecord = async (recordId: string, shareForm: ShareForm) => {
    if (!recordId || !shareForm.granteeId) {
      toast({
        title: "Error",
        description: "Please select a record and enter a provider ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createSharingPermission({
        medicalRecordId: recordId,
        granteeId: shareForm.granteeId,
        permissionType: shareForm.permissionType,
        expiresAt: shareForm.expiresAt || undefined
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Record shared successfully",
        });
        setIsShareDialogOpen(false);
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
        
        <ShareRecordDialog
          records={records}
          onShare={handleShareRecord}
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
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
