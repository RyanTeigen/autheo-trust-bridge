
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Eye, Lock } from 'lucide-react';
import { SharedRecord } from '@/hooks/useSharedRecordsAPI';

interface EncryptedRecordCardProps {
  sharedRecord: SharedRecord;
  onViewRecord: (shareId: string) => void;
  loading: boolean;
}

const EncryptedRecordCard: React.FC<EncryptedRecordCardProps> = ({
  sharedRecord,
  onViewRecord,
  loading
}) => {
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
              {sharedRecord.record.patient.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Shared: {formatDate(sharedRecord.sharedAt)}
              </span>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {sharedRecord.record.recordType}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-900/20 text-yellow-400 border-yellow-700/30">
              <Lock className="h-3 w-3" />
              Encrypted
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRecord(sharedRecord.shareId)}
              disabled={loading}
              className="flex items-center gap-1 border-slate-600 text-slate-300 hover:bg-slate-700"
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
            <span className="font-medium text-slate-300">Patient Email:</span>
            <p className="text-slate-400">{sharedRecord.record.patient.email}</p>
          </div>
          <div>
            <span className="font-medium text-slate-300">Record Created:</span>
            <p className="text-slate-400">{formatDate(sharedRecord.record.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EncryptedRecordCard;
