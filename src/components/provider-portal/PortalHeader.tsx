
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Bell } from 'lucide-react';

interface PortalHeaderProps {
  notificationCount: number;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ notificationCount }) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <h2 className="text-3xl font-semibold tracking-tight">Provider Portal</h2>
      <p className="text-muted-foreground">Access and manage patient health records</p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30 flex items-center">
          <Shield className="h-3.5 w-3.5 mr-1" /> HIPAA Compliant
        </Badge>
        <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 flex items-center">
          <Bell className="h-3.5 w-3.5 mr-1" /> {notificationCount} Alerts
        </Badge>
      </div>
    </div>
  );
};

export default PortalHeader;
