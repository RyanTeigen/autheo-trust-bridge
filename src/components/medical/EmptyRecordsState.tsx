
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyRecordsStateProps {
  onCreateRecord: () => void;
}

const EmptyRecordsState: React.FC<EmptyRecordsStateProps> = ({ onCreateRecord }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records</h3>
        <p className="text-gray-600 text-center mb-4">
          You haven't created any medical records yet. Add your first record to get started.
        </p>
        <Button onClick={onCreateRecord} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Record
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyRecordsState;
