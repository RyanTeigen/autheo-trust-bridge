
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Shield, User, Calendar, FileText, Lock, Unlock, Key, RefreshCw } from 'lucide-react';
import { useSharedRecordsAPI, SharedRecord, DecryptedSharedRecord } from '@/hooks/useSharedRecordsAPI';
import { useToast } from '@/hooks/use-toast';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shared Medical Records</h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4" />
            Records shared with quantum-safe encryption
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showPrivateKeyDialog} onOpenChange={setShowPrivateKeyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Set Private Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Private Key for Decryption</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="privateKey">ML-KEM Private Key (Base64)</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your private key is used to decrypt records shared with you
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPrivateKeyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={fetchDecryptedRecords} disabled={!privateKey}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Decrypt Records
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {sharedRecords.length} Records
          </Badge>
        </div>
      </div>

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
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Shared Records</h3>
                <p className="text-gray-600">
                  No medical records have been shared with you yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sharedRecords.map((sharedRecord) => (
                <Card key={sharedRecord.shareId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {sharedRecord.record.patient.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Shared: {formatDate(sharedRecord.sharedAt)}
                          </span>
                          <Badge variant="outline">
                            {sharedRecord.record.recordType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Encrypted
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRecord(sharedRecord.shareId)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Patient Email:</span>
                        <p className="text-gray-600">{sharedRecord.record.patient.email}</p>
                      </div>
                      <div>
                        <span className="font-medium">Record Created:</span>
                        <p className="text-gray-600">{formatDate(sharedRecord.record.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="decrypted" className="space-y-4">
          {decryptedRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Decrypted Records</h3>
                <p className="text-gray-600 mb-4">
                  Set your private key and decrypt records to view them here.
                </p>
                <Button onClick={() => setShowPrivateKeyDialog(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Set Private Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {decryptedRecords.map((record) => (
                <Card key={record.shareId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {record.record.patient.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Shared: {formatDate(record.sharedAt)}
                          </span>
                          <Badge variant="outline">
                            {record.record.recordType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={record.decryptionStatus === 'decrypted' ? 'default' : 'destructive'}
                          className="flex items-center gap-1"
                        >
                          {record.decryptionStatus === 'decrypted' ? (
                            <Unlock className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {record.decryptionStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {record.decryptionStatus === 'decrypted' && record.record.decryptedData && (
                    <CardContent>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Decrypted Content:</h4>
                        <div className="text-sm space-y-2">
                          <p><strong>Title:</strong> {record.record.decryptedData.title || 'N/A'}</p>
                          <p><strong>Description:</strong> {record.record.decryptedData.description || 'N/A'}</p>
                          {record.record.decryptedData.vitals && (
                            <div>
                              <strong>Vitals:</strong>
                              <pre className="mt-1 text-xs bg-white p-2 rounded border">
                                {JSON.stringify(record.record.decryptedData.vitals, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                  {record.decryptionStatus === 'failed' && (
                    <CardContent>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-700 text-sm">
                          <strong>Decryption Failed:</strong> {record.error}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewer" className="space-y-4">
          {selectedRecord ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Medical Record Details
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedRecord.record.patient.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedRecord.record.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={selectedRecord.decryptionStatus === 'decrypted' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {selectedRecord.decryptionStatus === 'decrypted' ? (
                        <Unlock className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {selectedRecord.decryptionStatus === 'decrypted' ? 'Decrypted' : 'Encrypted'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Record Type:</span>
                    <p className="text-gray-600">{selectedRecord.record.recordType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Shared At:</span>
                    <p className="text-gray-600">{formatDate(selectedRecord.sharedAt)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Record Content:</h4>
                  {selectedRecord.decryptionStatus === 'decrypted' && selectedRecord.record.decryptedData ? (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedRecord.record.decryptedData, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Record is Encrypted</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {selectedRecord.message || selectedRecord.error || 'This record requires your private key for decryption.'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Record Selected</h3>
                <p className="text-gray-600">
                  Select a record from the list to view its details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsViewer;
