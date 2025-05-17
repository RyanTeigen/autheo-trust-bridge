
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

const WalletInfoAlert: React.FC = () => {
  return (
    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-autheo-secondary shadow-sm">
      <ShieldCheck className="h-5 w-5 text-autheo-secondary" />
      <AlertTitle className="font-medium text-slate-800">Smart Wallet Active</AlertTitle>
      <AlertDescription className="text-slate-600">
        Your Smart Wallet is secured with quantum-resistant encryption. 
        You control who sees your data and when.
      </AlertDescription>
    </Alert>
  );
};

export default WalletInfoAlert;
