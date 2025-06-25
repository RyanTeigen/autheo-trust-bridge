
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, Unlock, Lock, Eye } from 'lucide-react';
import { DecryptedSharedRecord } from '@/hooks/useSharedRecordsAPI';

interface RecordViewerProps {
  selectedRecord: DecryptedSharedRecord | null;
}

const RecordViewer: React.FC<RecordViewerProps> = ({ selectedRecord }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedRecord) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Record Selected</h3>
          <p className="text-gray-600">
            Select a record from the list to view its details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
};

export default RecordViewer;
