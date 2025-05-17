
import React from 'react';
import HealthRecordCard from '@/components/ui/HealthRecordCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileSearch, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useNavigate } from 'react-router-dom';

interface HealthRecordsListProps {
  onToggleShare: (id: string, shared: boolean) => void;
  filter?: 'all' | 'shared' | 'private' | 'recent';
}

const HealthRecordsList: React.FC<HealthRecordsListProps> = ({ 
  onToggleShare,
  filter = 'all'
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getRecordsByFilter } = useHealthRecords();

  // Get records based on the filter
  const filteredRecords = getRecordsByFilter(filter);

  const handleDirectShare = (recordId: string) => {
    // Navigate to the shared records page with the record pre-selected
    toast({
      title: "Share record",
      description: "Redirecting to sharing controls for this record.",
    });
    
    navigate('/shared-records');
  };

  if (filteredRecords.length === 0) {
    return (
      <Alert variant="default" className="bg-slate-50 border-dashed text-sm p-3">
        <FileSearch className="h-4 w-4" />
        <AlertDescription className="text-sm">
          No records found. {filter !== 'all' && `Try switching to a different filter or tab.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {filteredRecords.map(record => (
        <div key={record.id} className="relative group">
          <HealthRecordCard
            {...record}
            onToggleShare={onToggleShare}
            className="transition-all duration-200 hover:border-autheo-primary hover:shadow-md"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
            onClick={() => handleDirectShare(record.id)}
          >
            <Share className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default HealthRecordsList;
