
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DecryptedMedicalRecord } from '@/types/medical';
import { Edit, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import PatientRecordHashCard from '@/components/patient/PatientRecordHashCard';

interface MedicalRecordCardProps {
  record: DecryptedMedicalRecord;
  onEdit: (record: DecryptedMedicalRecord) => void;
  onDelete: (id: string) => void;
  showHash?: boolean; // Optional prop to control hash display
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  onEdit,
  onDelete,
  showHash = true // Default to showing hash
}) => {
  const getStatusBadge = (record: DecryptedMedicalRecord) => {
    if (record.data?.error) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Encrypted</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      lab: 'bg-purple-100 text-purple-800',
      medication: 'bg-green-100 text-green-800',
      visit: 'bg-orange-100 text-orange-800',
      imaging: 'bg-red-100 text-red-800'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {record.data?.title || 'Untitled Record'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getCategoryColor(record.record_type)}>
                  {record.record_type}
                </Badge>
                {getStatusBadge(record)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(record)}
                disabled={!!record.data?.error}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(record.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {record.data?.description && (
              <div>
                <strong>Description:</strong> {record.data.description}
              </div>
            )}
            {record.data?.notes && (
              <div>
                <strong>Notes:</strong> {record.data.notes}
              </div>
            )}
            <div>
              <strong>Created:</strong> {new Date(record.created_at).toLocaleDateString()}
            </div>
            {record.data?.error && (
              <div className="text-red-600">
                <strong>Error:</strong> {record.data.error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Display record hash if enabled */}
      {showHash && (
        <PatientRecordHashCard recordId={record.id} />
      )}
    </div>
  );
};

export default MedicalRecordCard;
