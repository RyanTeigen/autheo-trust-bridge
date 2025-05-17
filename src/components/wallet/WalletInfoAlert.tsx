
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ShieldCheck } from 'lucide-react';

const WalletInfoAlert: React.FC = () => {
  return (
    <Alert className="bg-gradient-to-r from-slate-50 to-blue-50 border-l-4 border-l-blue-500">
      <ShieldCheck className="h-4 w-4 text-blue-600" />
      <AlertTitle className="font-medium">Smart Wallet Active</AlertTitle>
      <AlertDescription className="text-slate-600">
        Your Smart Wallet is secured with quantum-resistant encryption. You control who sees your data and when.
      </AlertDescription>
    </Alert>
  );
};

export default WalletInfoAlert;
