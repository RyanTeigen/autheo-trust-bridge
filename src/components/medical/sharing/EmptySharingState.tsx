
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Shield } from 'lucide-react';

interface EmptySharingStateProps {
  onStartSharing: () => void;
}

const EmptySharingState: React.FC<EmptySharingStateProps> = ({ onStartSharing }) => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-blue-50 p-3 mb-4">
          <Share2 className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No shared records yet</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          You haven't shared any medical records with healthcare providers or other authorized users yet. 
          Start sharing to give others secure access to your health information.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Shield className="h-4 w-4" />
          <span>All sharing is encrypted and time-limited for your security</span>
        </div>
        <Button onClick={onStartSharing}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Your First Record
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptySharingState;
