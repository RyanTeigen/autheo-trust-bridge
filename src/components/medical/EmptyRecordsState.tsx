
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyRecordsStateProps {
  onCreateRecord: () => void;
}

const EmptyRecordsState: React.FC<EmptyRecordsStateProps> = ({ onCreateRecord }) => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-blue-50 p-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No medical records yet</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Start building your secure digital health record by adding your first medical record. 
          All data is encrypted and stored securely.
        </p>
        <Button onClick={onCreateRecord}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Record
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyRecordsState;
