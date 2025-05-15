
import React from 'react';
import HealthRecordCard, { HealthRecordCardProps } from '@/components/ui/HealthRecordCard';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredRecords.map(record => (
        <HealthRecordCard
          key={record.id}
          {...record}
          onToggleShare={onToggleShare}
        />
      ))}
    </div>
  );
};

export default HealthRecordsList;
