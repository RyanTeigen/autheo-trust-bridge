
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Unlock, Lock } from 'lucide-react';
import { DecryptedSharedRecord } from '@/hooks/useSharedRecordsAPI';

interface DecryptedRecordCardProps {
  record: DecryptedSharedRecord;
}

const DecryptedRecordCard: React.FC<DecryptedRecordCardProps> = ({ record }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:shadow-lg hover:border-slate-600 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <User className="h-5 w-5" />
              {record.record.patient.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Shared: {formatDate(record.sharedAt)}
              </span>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {record.record.recordType}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={record.decryptionStatus === 'decrypted' ? 'default' : 'destructive'}
              className={`flex items-center gap-1 ${
                record.decryptionStatus === 'decrypted' 
                  ? 'bg-green-900/20 text-green-400 border-green-700/30' 
                  : 'bg-red-900/20 text-red-400 border-red-700/30'
              }`}
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
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
            <h4 className="font-medium mb-2 text-green-400">Decrypted Content:</h4>
            <div className="text-sm space-y-2">
              <p className="text-slate-300"><strong>Title:</strong> {record.record.decryptedData.title || 'N/A'}</p>
              <p className="text-slate-300"><strong>Description:</strong> {record.record.decryptedData.description || 'N/A'}</p>
              {record.record.decryptedData.vitals && (
                <div>
                  <strong className="text-slate-300">Vitals:</strong>
                  <pre className="mt-1 text-xs bg-slate-700 p-2 rounded border border-slate-600 text-slate-300">
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
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
            <p className="text-red-400 text-sm">
              <strong>Decryption Failed:</strong> {record.error}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DecryptedRecordCard;
