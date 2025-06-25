
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Unlock, Eye, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { loading, getSharedRecords, getDecryptedSharedRecords, decryptSharedRecord } = useSharedRecordsAPI();

  useEffect(() => {
    fetchSharedRecords();
  }, []);

  const fetchSharedRecords = async () => {
    try {
      setError(null);
      const result = await getSharedRecords();
      if (result.success && result.data) {
        setSharedRecords(result.data);
      } else {
        setError(result.error || 'Failed to fetch shared records');
      }
    } catch (err) {
      console.error('Error fetching shared records:', err);
      setError('An unexpected error occurred while fetching shared records');
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
      } else {
        setError(result.error || 'Failed to decrypt record');
      }
    } catch (err) {
      console.error('Error viewing record:', err);
      setError('An unexpected error occurred while viewing the record');
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
