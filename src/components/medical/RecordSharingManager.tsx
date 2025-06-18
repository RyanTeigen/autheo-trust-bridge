
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PatientRecordsService } from '@/services/PatientRecordsService';
import { MedicalRecordsService, DecryptedMedicalRecord } from '@/services/MedicalRecordsService';
import { SharingPermission } from '@/types/medical';
import { Shield } from 'lucide-react';
import ShareRecordDialog from './sharing/ShareRecordDialog';
import SharingPermissionCard from './sharing/SharingPermissionCard';
import EmptySharingState from './sharing/EmptySharingState';

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
      const result = await PatientRecordsService.shareRecordWithProvider(
        recordId,
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
