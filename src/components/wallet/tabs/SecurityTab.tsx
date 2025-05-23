
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, Lock, Shield, AlertCircle } from 'lucide-react';
import SelfSovereignIdentity from '@/components/decentralized/SelfSovereignIdentity';
import ZeroKnowledgeVerification from '@/components/decentralized/ZeroKnowledgeVerification';
import { useWallet } from '@/hooks/use-wallet';

const SecurityTab: React.FC = () => {
  const { wallet, connectMetaMask } = useWallet();

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="bg-slate-800/50 border-slate-700/50 text-slate-100">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-autheo-primary" />
            <CardTitle className="text-lg font-medium">Wallet Authentication</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Connect your blockchain wallet for enhanced security and to sign transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wallet ? (
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Connected Wallet</span>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>
                <div className="font-mono text-xs bg-slate-800 p-2 rounded truncate">
                  {wallet.address}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Your wallet is securely connected. You can now sign transactions and access your health records.
                </p>
              </div>
              
              <div className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-full">
                    <Lock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Enhanced Security Features</h3>
                    <p className="text-xs text-slate-400">
                      Your wallet connection provides cryptographic proof of your identity and enables secure access to your medical records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center">
                <Lock className="h-10 w-10 mx-auto text-slate-500 mb-3" />
                <h3 className="text-lg font-medium mb-2">No Wallet Connected</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Connect your blockchain wallet to enhance security and enable decentralized features
                </p>
                <Button 
                  className="bg-autheo-primary hover:bg-autheo-primary/90"
                  onClick={connectMetaMask}
                >
                  Connect Wallet
                </Button>
              </div>
              
              <div className="border border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Why Connect a Wallet?</h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-autheo-primary mt-0.5" />
                    <span>Enhanced security for your medical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Key className="h-4 w-4 text-autheo-primary mt-0.5" />
                    <span>Cryptographically sign consent for data sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-autheo-primary mt-0.5" />
                    <span>Control your medical identity with self-sovereign principles</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelfSovereignIdentity />
        <ZeroKnowledgeVerification />
      </div>
    </div>
  );
};

export default SecurityTab;
