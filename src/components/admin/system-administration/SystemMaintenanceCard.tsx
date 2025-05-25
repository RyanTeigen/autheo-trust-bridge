
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Download, RefreshCw, Database, AlertTriangle } from 'lucide-react';

interface SystemMaintenanceCardProps {
  onSystemAction: (action: string) => void;
}

const SystemMaintenanceCard: React.FC<SystemMaintenanceCardProps> = ({ onSystemAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => onSystemAction('Backup')}
          className="w-full justify-start"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Create System Backup
        </Button>
        
        <Button 
          onClick={() => onSystemAction('Update')}
          className="w-full justify-start"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Check for Updates
        </Button>
        
        <Button 
          onClick={() => onSystemAction('Cleanup')}
          className="w-full justify-start"
          variant="outline"
        >
          <Database className="h-4 w-4 mr-2" />
          Database Cleanup
        </Button>
        
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System maintenance actions may temporarily affect service availability.
            Schedule during low-usage periods when possible.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SystemMaintenanceCard;
