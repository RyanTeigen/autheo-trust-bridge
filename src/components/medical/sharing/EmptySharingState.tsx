
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface EmptySharingStateProps {
  onStartSharing: () => void;
}

const EmptySharingState: React.FC<EmptySharingStateProps> = ({ onStartSharing }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Share2 className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No shared records</h3>
        <p className="text-gray-600 text-center mb-4">
          You haven't shared any medical records with healthcare providers yet.
        </p>
        <Button onClick={onStartSharing} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Your First Record
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptySharingState;
