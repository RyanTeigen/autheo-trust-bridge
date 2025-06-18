
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

interface MedicalRecordsGridProps {
  records: DecryptedRecord[];
  onRecordSelect: (record: DecryptedRecord) => void;
}

const MedicalRecordsGrid: React.FC<MedicalRecordsGridProps> = ({
  records,
  onRecordSelect
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <Card key={record.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader onClick={() => onRecordSelect(record)}>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{record.data.title || 'Untitled Record'}</CardTitle>
                <CardDescription>
                  {new Date(record.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary">{record.record_type}</Badge>
            </div>
          </CardHeader>
          <CardContent onClick={() => onRecordSelect(record)}>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {record.data.description || record.data.diagnosis || 'No description available'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MedicalRecordsGrid;
