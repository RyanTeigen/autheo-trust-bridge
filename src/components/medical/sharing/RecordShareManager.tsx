import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMedicalRecordsSharing } from '@/hooks/useMedicalRecordsSharing';
import { Shield, Share2, Eye } from 'lucide-react';
import ShareForm from './record-share-manager/ShareForm';
import SharesList from './record-share-manager/SharesList';

interface RecordShareManagerProps {
  recordId?: string;
  recordTitle?: string;
}

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

const RecordShareManager: React.FC<RecordShareManagerProps> = ({ 
  recordId: propRecordId, 
  recordTitle: propRecordTitle 
}) => {
  const { toast } = useToast();
  const { shareRecord, getSharedWithMe, getMyShares, revokeShare, loading } = useMedicalRecordsSharing();
  
  const [myShares, setMyShares] = useState<QuantumShare[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<QuantumShare[]>([]);
  const [activeTab, setActiveTab] = useState<'share' | 'my-shares' | 'shared-with-me'>('share');

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    const [mySharesResult, sharedWithMeResult] = await Promise.all([
      getMyShares(),
      getSharedWithMe()
    ]);

    if (mySharesResult.success && mySharesResult.data?.permissions) {
      // Transform the data to match our interface - handle both quantum and legacy formats
      const transformedShares = mySharesResult.data.permissions.map((share: any) => ({
        id: share.id,
        record_id: share.record_id || share.medical_record_id,
        shared_with_user_id: share.shared_with_user_id || share.grantee_id,
        created_at: share.created_at,
        updated_at: share.updated_at || share.created_at,
        pq_encrypted_key: share.pq_encrypted_key,
        medical_records: share.medical_records ? {
          id: share.medical_records.id,
          record_type: share.medical_records.record_type,
          patient_id: share.medical_records.patient_id,
          created_at: share.medical_records.created_at,
          patients: share.medical_records.patients ? {
            full_name: share.medical_records.patients.full_name || 'Unknown',
            email: share.medical_records.patients.email || '',
            user_id: share.medical_records.patients.user_id
          } : undefined
        } : undefined
      }));
      setMyShares(transformedShares);
    }

    if (sharedWithMeResult.success && sharedWithMeResult.data?.permissions) {
      // Transform the data to match our interface
      const transformedShares = sharedWithMeResult.data.permissions.map((share: any) => ({
        id: share.id,
        record_id: share.record_id || share.medical_record_id,
        shared_with_user_id: share.shared_with_user_id || share.grantee_id,
        created_at: share.created_at,
        updated_at: share.updated_at || share.created_at,
        pq_encrypted_key: share.pq_encrypted_key,
        medical_records: share.medical_records ? {
          id: share.medical_records.id,
          record_type: share.medical_records.record_type,
          patient_id: share.medical_records.patient_id,
          created_at: share.medical_records.created_at,
          patients: share.medical_records.patients ? {
            full_name: share.medical_records.patients.full_name || 'Unknown',
            email: share.medical_records.patients.email || '',
            user_id: share.medical_records.patients.user_id
          } : undefined
        } : undefined
      }));
      setSharedWithMe(transformedShares);
    }
  };

  const handleShare = async (recipientUserId: string) => {
    if (!propRecordId) return;
    
    const result = await shareRecord(propRecordId, recipientUserId);
    if (result.success) {
      fetchShares();
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    const result = await revokeShare(shareId);
    if (result.success) {
      fetchShares();
    }
  };

  if (!propRecordId) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-autheo-primary flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quantum-Safe Record Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('my-shares')}
                className={`justify-start ${activeTab === 'my-shares' ? 'bg-autheo-primary/20 border-autheo-primary' : ''}`}
              >
                <Share2 className="h-4 w-4 mr-2" />
                My Shares ({myShares.length})
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setActiveTab('shared-with-me')}
                className={`justify-start ${activeTab === 'shared-with-me' ? 'bg-autheo-primary/20 border-autheo-primary' : ''}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Shared with Me ({sharedWithMe.length})
              </Button>
            </div>

            {activeTab === 'my-shares' && (
              <SharesList
                title="Records I've Shared"
                shares={myShares}
                icon={Shield}
                emptyMessage="You haven't shared any records yet. Use the sharing feature in individual record views to start sharing."
                showRevokeButton={true}
                onRevoke={handleRevokeShare}
                loading={loading}
              />
            )}

            {activeTab === 'shared-with-me' && (
              <SharesList
                title="Records Shared with Me"
                shares={sharedWithMe}
                icon={Eye}
                emptyMessage="No records have been shared with you yet."
                showRevokeButton={false}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ShareForm
        recordId={propRecordId}
        recordTitle={propRecordTitle || 'Unknown Record'}
        onShare={handleShare}
        loading={loading}
      />
    </div>
  );
};

export default RecordShareManager;
