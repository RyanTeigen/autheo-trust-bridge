
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Database, AlertTriangle } from 'lucide-react';

interface DataManagementCardProps {
  onSystemAction: (action: string) => void;
}

const DataManagementCard: React.FC<DataManagementCardProps> = ({ onSystemAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => onSystemAction('Export')}
          className="w-full justify-start"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Export System Data
        </Button>
        
        <Button 
          onClick={() => onSystemAction('Import')}
          className="w-full justify-start"
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>
        
        <Button 
          onClick={() => onSystemAction('Archive')}
          className="w-full justify-start"
          variant="outline"
        >
          <Database className="h-4 w-4 mr-2" />
          Archive Old Records
        </Button>
        
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Data operations are logged and require administrative approval for
            sensitive operations.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DataManagementCard;
