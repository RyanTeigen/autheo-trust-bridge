
import React from 'react';
import { Wallet } from 'lucide-react';

const WalletHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg">
        <Wallet className="h-6 w-6 text-autheo-dark" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Smart Wallet</h1>
        <p className="text-muted-foreground">
          Control and manage access to your health records
        </p>
      </div>
    </div>
  );
};

export default WalletHeader;
