
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, ChevronDown, ChevronUp, Info, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WalletInfoAlert: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-autheo-secondary shadow-sm p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-autheo-secondary mt-0.5" />
          <div>
            <AlertTitle className="font-medium text-slate-800 text-sm">Smart Wallet Active</AlertTitle>
            <AlertDescription className="text-slate-600 text-xs">
              Your Smart Wallet is secured with quantum-resistant encryption. 
              You control who sees your data and when.
            </AlertDescription>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </Button>
      </div>
      
      {expanded && (
        <div className="mt-2 pl-6 border-t border-slate-100 pt-2">
          <div className="text-xs space-y-2 text-slate-600">
            <div className="flex items-start gap-1.5">
              <Info className="h-3 w-3 text-autheo-secondary mt-0.5 flex-shrink-0" />
              <p><span className="font-medium">Zero-Knowledge Proofs</span>: Share verification without revealing the underlying data</p>
            </div>
            <div className="flex items-start gap-1.5">
              <Info className="h-3 w-3 text-autheo-secondary mt-0.5 flex-shrink-0" />
              <p><span className="font-medium">Self-Sovereign Identity</span>: You own and control your digital identity</p>
            </div>
            <div className="flex items-start gap-1.5">
              <Info className="h-3 w-3 text-autheo-secondary mt-0.5 flex-shrink-0" />
              <p><span className="font-medium">Distributed Storage</span>: Your data is encrypted and stored across multiple secure nodes</p>
            </div>
            <div className="flex items-start gap-1.5">
              <CreditCard className="h-3 w-3 text-autheo-secondary mt-0.5 flex-shrink-0" />
              <p><span className="font-medium">Insurance Verification</span>: Verify and share insurance information securely with providers</p>
            </div>
          </div>
        </div>
      )}
    </Alert>
  );
};

export default WalletInfoAlert;
