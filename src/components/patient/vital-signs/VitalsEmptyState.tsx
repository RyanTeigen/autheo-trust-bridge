
import React from 'react';
import { Activity } from 'lucide-react';

export const VitalsEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500">No recent vital signs found.</p>
      <p className="text-sm text-slate-400 mt-1">
        Vital signs will appear here once they are recorded as atomic data points.
      </p>
    </div>
  );
};
