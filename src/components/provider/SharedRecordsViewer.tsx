
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Unlock, Eye } from 'lucide-react';
import { useSharedRecordsAPI, SharedRecord, DecryptedSharedRecord } from '@/hooks/useSharedRecordsAPI';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  
  const { loading, getSharedRecords, getDecryptedSharedRecords, decryptSharedRecord } = useSharedRecordsAPI();

  useEffect(() => {
    fetchSharedRecords();
  }, []);

  const fetchSharedRecords = async () => {
    const result = await getSharedRecords();
    if (result.success && result.data) {
      setSharedRecords(result.data);
    }
  };

  const fetchDecryptedRecords = async () => {
    if (!privateKey) {
      toast({
        title: "Private Key Required",
        description: "Please provide your private key to decrypt records",
        variant: "destructive",
      });
      return;
    }

    const result = await getDecryptedSharedRecords(privateKey);
    if (result.success && result.data) {
      setDecryptedRecords(result.data);
      setShowPrivateKeyDialog(false);
      toast({
        title: "Success",
        description: `Decrypted ${result.data.filter(r => r.decryptionStatus === 'decrypted').length} of ${result.data.length} records`,
      });
    }
  };

  const handleViewRecord = async (shareId: string) => {
    const result = await decryptSharedRecord(shareId, privateKey);
    if (result.success && result.data) {
      setSelectedRecord(result.data);
      setActiveTab('viewer');
    }
  };

  if (loading && sharedRecords.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading shared records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SharedRecordsHeader
        recordsCount={sharedRecords.length}
        showPrivateKeyDialog={showPrivateKeyDialog}
        setShowPrivateKeyDialog={setShowPrivateKeyDialog}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        onDecryptRecords={fetchDecryptedRecords}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">
            <FileText className="h-4 w-4 mr-2" />
            Encrypted Records
          </TabsTrigger>
          <TabsTrigger value="decrypted">
            <Unlock className="h-4 w-4 mr-2" />
            Decrypted Records ({decryptedRecords.length})
          </TabsTrigger>
          <TabsTrigger value="viewer" disabled={!selectedRecord}>
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
