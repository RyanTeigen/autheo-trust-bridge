
import React from 'react';
import { Wallet } from 'lucide-react';

const WalletHeader: React.FC = () => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
          <Wallet className="h-6 w-6 text-autheo-dark" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-gradient-primary bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Smart Wallet</h1>
          <p className="text-muted-foreground text-sm">
            Control and manage access to your health records with quantum-resistant encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletHeader;
