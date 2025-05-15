
import React from 'react';
import { Clock } from 'lucide-react';
import AuditLogItem, { AuditLogItemProps } from '@/components/ui/AuditLogItem';

interface AuditLogsListProps {
  filteredLogs: AuditLogItemProps[];
}

export const AuditLogsList: React.FC<AuditLogsListProps> = ({ filteredLogs }) => {
  if (filteredLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No matching audit logs</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredLogs.map((log) => (
        <AuditLogItem key={log.id} {...log} />
      ))}
    </div>
  );
};

export default AuditLogsList;
