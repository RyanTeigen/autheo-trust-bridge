
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Shield, 
  Calendar, 
  User, 
  FileText,
  Pill,
  Heart,
  TestTube,
  Stethoscope
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DecryptedRecord } from '@/services/encryption/MedicalRecordsEncryption';

interface MedicalRecordsGridProps {
  records: DecryptedRecord[];
  onUpdate: (id: string, data: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const MedicalRecordsGrid: React.FC<MedicalRecordsGridProps> = ({ 
  records, 
  onUpdate, 
  onDelete 
}) => {
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'lab': return <TestTube className="h-4 w-4" />;
      case 'imaging': return <FileText className="h-4 w-4" />;
      case 'surgery': return <Heart className="h-4 w-4" />;
      case 'consultation': return <Stethoscope className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication': return 'bg-blue-100/20 text-blue-300 border-blue-300/30';
      case 'lab': return 'bg-purple-100/20 text-purple-300 border-purple-300/30';
      case 'imaging': return 'bg-amber-100/20 text-amber-300 border-amber-300/30';
      case 'surgery': return 'bg-red-100/20 text-red-300 border-red-300/30';
      case 'consultation': return 'bg-green-100/20 text-green-300 border-green-300/30';
      default: return 'bg-slate-100/20 text-slate-300 border-slate-300/30';
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const success = await onDelete(id);
      if (success) {
        toast({
          title: "Success",
          description: "Medical record deleted successfully",
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <Card key={record.id} className="bg-slate-800 border-slate-700 hover:border-autheo-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {getCategoryIcon(record.data.category || record.record_type)}
                <CardTitle className="text-autheo-primary text-lg">
                  {record.data.title || 'Untitled Record'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-400" />
                <Badge 
                  variant="outline" 
                  className={getCategoryColor(record.data.category || record.record_type)}
                >
                  {record.data.category || record.record_type}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Description */}
            <div>
              <p className="text-slate-300 text-sm line-clamp-3">
                {record.data.description || 'No description available'}
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-xs text-slate-400">
              {record.data.provider && (
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{record.data.provider}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  {record.data.date ? 
                    new Date(record.data.date).toLocaleDateString() : 
                    new Date(record.created_at).toLocaleDateString()
                  }
                </span>
              </div>
            </div>

            {/* Additional Info */}
            {(record.data.medications || record.data.allergies || record.data.vitals) && (
              <div className="space-y-1 pt-2 border-t border-slate-700">
                {record.data.medications && (
                  <p className="text-xs text-slate-400">
                    <span className="font-medium">Medications:</span> {record.data.medications}
                  </p>
                )}
                {record.data.allergies && (
                  <p className="text-xs text-slate-400">
                    <span className="font-medium">Allergies:</span> {record.data.allergies}
                  </p>
                )}
                {record.data.vitals && (
                  <p className="text-xs text-slate-400">
                    <span className="font-medium">Vitals:</span> {record.data.vitals}
                  </p>
                )}
              </div>
            )}

            {/* Encryption metadata */}
            {record.metadata && (
              <div className="pt-2 border-t border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="h-3 w-3" />
                  <span>Encrypted with {record.metadata.algorithm}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast({
                  title: "Info",
                  description: "Edit functionality will be implemented with re-encryption",
                  variant: "default",
                })}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(record.id, record.data.title || 'Record')}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MedicalRecordsGrid;
