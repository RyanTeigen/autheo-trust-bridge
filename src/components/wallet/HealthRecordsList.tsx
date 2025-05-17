
import React from 'react';
import HealthRecordCard, { HealthRecordCardProps } from '@/components/ui/HealthRecordCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileSearch, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthRecordsListProps {
  records: Omit<HealthRecordCardProps, 'onToggleShare'>[];
  onToggleShare: (id: string, shared: boolean) => void;
  filter?: 'all' | 'shared' | 'private' | 'recent';
}

const HealthRecordsList: React.FC<HealthRecordsListProps> = ({ 
  records, 
  onToggleShare,
  filter = 'all'
}) => {
  const { toast } = useToast();

  // Apply filters based on the selected tab
  const filteredRecords = React.useMemo(() => {
    switch (filter) {
      case 'shared':
        return records.filter(record => record.isShared);
      case 'private':
        return records.filter(record => !record.isShared);
      case 'recent':
        return [...records]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
      case 'all':
      default:
        return records;
    }
  }, [records, filter]);

  const handleDirectShare = (recordId: string) => {
    // This would normally navigate to the shared records page with the record pre-selected
    // For now, we'll just show a toast with information
    toast({
      title: "Share record",
      description: "Redirecting to sharing controls for this record.",
    });
    
    // In a real implementation, this would use React Router to navigate
    window.location.href = '/shared-records';
  };

  if (filteredRecords.length === 0) {
    return (
      <Alert variant="default" className="bg-slate-50 border-dashed">
        <FileSearch className="h-4 w-4" />
        <AlertDescription>
          No records found. {filter !== 'all' && `Try switching to a different filter or tab.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDirectShare(record.id)}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default HealthRecordsList;
