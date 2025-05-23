
import React from 'react';
import { AuditLogEntry } from '../types/note';

interface AccessHistoryListProps {
  accessHistory: AuditLogEntry[];
}

const AccessHistoryList: React.FC<AccessHistoryListProps> = ({ accessHistory }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mt-4 border rounded-md p-3 bg-white">
      <h4 className="font-medium text-sm mb-2">Access History</h4>
      <div className="space-y-2 max-h-[120px] overflow-y-auto text-xs">
        {accessHistory.map((entry) => (
          <div key={entry.id} className="flex justify-between border-b pb-1 last:border-0">
            <div>
              {entry.action === 'grant_access' ? (
                <span className="text-green-600">✓ Access granted</span>
              ) : (
                <span className="text-red-600">✗ Access revoked</span>
              )}
            </div>
            <div className="text-slate-500">
              {formatDate(entry.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessHistoryList;
