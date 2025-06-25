
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Shield, User, Calendar, FileText, Lock, Unlock } from 'lucide-react';
import { useSharedRecordsAPI, SharedRecord, DecryptedSharedRecord } from '@/hooks/useSharedRecordsAPI';
import { useToast } from '@/hooks/use-toast';

const SharedRecordsViewer: React.FC = () => {
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DecryptedSharedRecord | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();
  
  const { loading, getSharedRecords, decryptSharedRecord } = useSharedRecordsAPI();

  useEffect(() => {
    fetchSharedRecords();
  }, []);

  const fetchSharedRecords = async () => {
    const result = await getSharedRecords();
    if (result.success && result.data) {
      setSharedRecords(result.data);
    }
  };

  const handleViewRecord = async (shareId: string) => {
    const result = await decryptSharedRecord(shareId);
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
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {sharedRecords.length} Records
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">
            <FileText className="h-4 w-4 mr-2" />
            Records List
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
                          <Shield className="h-3 w-3" />
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
                  {selectedRecord.decryptionStatus === 'decrypted' ? (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedRecord.decryptedData, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Record is Encrypted</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {selectedRecord.message || 'This record requires provider private key for decryption.'}
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
