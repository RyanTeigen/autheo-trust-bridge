
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Key } from 'lucide-react';

interface EmptyRecordsStateProps {
  type: 'encrypted' | 'decrypted';
  onSetPrivateKey?: () => void;
}

const EmptyRecordsState: React.FC<EmptyRecordsStateProps> = ({ type, onSetPrivateKey }) => {
  if (type === 'encrypted') {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Shared Records</h3>
          <p className="text-gray-600">
            No medical records have been shared with you yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Decrypted Records</h3>
        <p className="text-gray-600 mb-4">
          Set your private key and decrypt records to view them here.
        </p>
        {onSetPrivateKey && (
          <Button onClick={onSetPrivateKey}>
            <Key className="h-4 w-4 mr-2" />
            Set Private Key
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyRecordsState;
