
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const WalletInfoAlert: React.FC = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Smart Wallet Active</AlertTitle>
      <AlertDescription>
        Your Smart Wallet is secured with quantum-resistant encryption. You control who sees your data and when.
      </AlertDescription>
    </Alert>
  );
};

export default WalletInfoAlert;
