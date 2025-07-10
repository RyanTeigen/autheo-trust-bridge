
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Unlock, Eye, AlertCircle } from 'lucide-react';
import { useSharedRecordsAPI, SharedRecord, DecryptedSharedRecord } from '@/hooks/useSharedRecordsAPI';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import SharedRecordsHeader from './shared-records/SharedRecordsHeader';
import EncryptedRecordCard from './shared-records/EncryptedRecordCard';
import DecryptedRecordCard from './shared-records/DecryptedRecordCard';
import RecordViewer from './shared-records/RecordViewer';
import EmptyRecordsState from './shared-records/EmptyRecordsState';

const SharedRecordsViewer: React.FC = () => {
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([]);
  const [decryptedRecords, setDecryptedRecords] = useState<DecryptedSharedRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DecryptedSharedRecord | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logAccess, logError } = useAuditLog();
  
  const { loading, getSharedRecords, getDecryptedSharedRecords, decryptSharedRecord } = useSharedRecordsAPI();

  useEffect(() => {
    fetchSharedRecords();
  }, []);

  const fetchSharedRecords = async () => {
    try {
      setError(null);
      
      // Use the new edge function for better audit logging
      const { data, error } = await supabase.functions.invoke('get_provider_accessible_records');
      
      if (error) {
        throw error;
      }

      if (data.success) {
        // Transform the data to match the existing interface
        const transformedRecords = data.data.map((record: any) => ({
          shareId: record.sharing_permissions[0]?.id || record.id,
          recordId: record.id,
          recordType: record.record_type,
          patientName: record.patients.full_name,
          patientEmail: record.patients.email,
          sharedAt: record.sharing_permissions[0]?.responded_at || record.created_at,
          encryptedKey: record.encrypted_data, // This would be the actual encrypted key in practice
          sharedBy: record.patients.user_id
        }));
        
        setSharedRecords(transformedRecords);
        
        // Log the access
        await logAccess('medical_records', '', `Fetched ${transformedRecords.length} shared records`);
      } else {
        throw new Error(data.error || 'Failed to fetch shared records');
      }
    } catch (err: any) {
      console.error('Error fetching shared records:', err);
      setError('An unexpected error occurred while fetching shared records');
      await logError('FETCH_SHARED_RECORDS', 'medical_records', err.message);
    }
  };

  const fetchDecryptedRecords = async () => {
    if (!privateKey.trim()) {
      toast({
        title: "Private Key Required",
        description: "Please provide your private key to decrypt records",
        variant: "destructive",
      });
      return;
    }

    try {
      setError(null);
      const result = await getDecryptedSharedRecords(privateKey);
      if (result.success && result.data) {
        setDecryptedRecords(result.data);
        setShowPrivateKeyDialog(false);
        
        const successCount = result.data.filter(r => r.decryptionStatus === 'decrypted').length;
        const totalCount = result.data.length;
        
        toast({
          title: "Decryption Complete",
          description: `Successfully decrypted ${successCount} of ${totalCount} records`,
        });
      } else {
        setError(result.error || 'Failed to decrypt records');
      }
    } catch (err) {
      console.error('Error decrypting records:', err);
      setError('An unexpected error occurred while decrypting records');
    }
  };

  const handleViewRecord = async (shareId: string) => {
    if (!privateKey.trim()) {
      toast({
        title: "Private Key Required",
        description: "Please set your private key first to decrypt records",
        variant: "destructive",
      });
      setShowPrivateKeyDialog(true);
      return;
    }

    try {
      setError(null);
      const result = await decryptSharedRecord(shareId, privateKey);
      if (result.success && result.data) {
        setSelectedRecord(result.data);
        setActiveTab('viewer');
        
        // Log the record view
        await logAccess('medical_records', result.data.recordId, `Viewed decrypted record: ${result.data.record.recordType}`);
        
        toast({
          title: "Record Accessed",
          description: `Successfully decrypted and viewing ${result.data.record.recordType}`,
        });
      } else {
        setError(result.error || 'Failed to decrypt record');
        await logError('DECRYPT_RECORD', 'medical_records', result.error || 'Unknown error', shareId);
      }
    } catch (err: any) {
      console.error('Error viewing record:', err);
      setError('An unexpected error occurred while viewing the record');
      await logError('VIEW_RECORD', 'medical_records', err.message, shareId);
    }
  };

  if (loading && sharedRecords.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-slate-300">Loading shared records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SharedRecordsHeader
        recordsCount={sharedRecords.length}
        showPrivateKeyDialog={showPrivateKeyDialog}
        setShowPrivateKeyDialog={setShowPrivateKeyDialog}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        onDecryptRecords={fetchDecryptedRecords}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="list" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
            <FileText className="h-4 w-4 mr-2" />
            Encrypted Records ({sharedRecords.length})
          </TabsTrigger>
          <TabsTrigger value="decrypted" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
            <Unlock className="h-4 w-4 mr-2" />
            Decrypted Records ({decryptedRecords.length})
          </TabsTrigger>
          <TabsTrigger value="viewer" disabled={!selectedRecord} className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
            <Eye className="h-4 w-4 mr-2" />
            Record Viewer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {sharedRecords.length === 0 ? (
            <EmptyRecordsState type="encrypted" />
          ) : (
            <div className="grid gap-4">
              {sharedRecords.map((sharedRecord) => (
                <EncryptedRecordCard
                  key={sharedRecord.shareId}
                  sharedRecord={sharedRecord}
                  onViewRecord={handleViewRecord}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="decrypted" className="space-y-4">
          {decryptedRecords.length === 0 ? (
            <EmptyRecordsState 
              type="decrypted" 
              onSetPrivateKey={() => setShowPrivateKeyDialog(true)}
            />
          ) : (
            <div className="grid gap-4">
              {decryptedRecords.map((record) => (
                <DecryptedRecordCard
                  key={record.shareId}
                  record={record}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewer" className="space-y-4">
          <RecordViewer selectedRecord={selectedRecord} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsViewer;
