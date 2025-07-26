
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Lock, Shield, AlertCircle, Share2, Atom } from 'lucide-react';
import SelfSovereignIdentity from '@/components/decentralized/SelfSovereignIdentity';
import ZeroKnowledgeVerification from '@/components/decentralized/ZeroKnowledgeVerification';
import RecordShareManager from '@/components/medical/sharing/RecordShareManager';
import { useWallet } from '@/hooks/use-wallet';

const SecurityTab: React.FC = () => {
  const { wallet, connectMetaMask } = useWallet();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="authentication" className="data-[state=active]:bg-autheo-primary/20">
            <Key className="h-4 w-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="quantum-sharing" className="data-[state=active]:bg-autheo-primary/20">
            <Atom className="h-4 w-4 mr-2" />
            Quantum Sharing
          </TabsTrigger>
          <TabsTrigger value="identity" className="data-[state=active]:bg-autheo-primary/20">
            <Shield className="h-4 w-4 mr-2" />
            Digital Identity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="quantum-sharing" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50 text-slate-100">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Atom className="h-5 w-5 text-autheo-primary" />
                <CardTitle className="text-lg font-medium">Quantum-Safe Record Sharing</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Share your medical records using post-quantum cryptography for future-proof security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-autheo-primary/10 border border-autheo-primary/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-autheo-primary/20 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-autheo-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-autheo-primary">Enhanced Protection</h3>
                    <p className="text-xs text-slate-300">
                      Your records are protected with quantum-resistant encryption that remains secure even against future quantum computers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="bg-autheo-primary/20 p-2 rounded-full mt-1">
                    <span className="text-xs font-bold text-autheo-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200">Select Records</h4>
                    <p className="text-sm text-slate-400">Choose which medical records you want to share</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="bg-autheo-primary/20 p-2 rounded-full mt-1">
                    <span className="text-xs font-bold text-autheo-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200">Quantum Encryption</h4>
                    <p className="text-sm text-slate-400">Records are encrypted with post-quantum algorithms</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="bg-autheo-primary/20 p-2 rounded-full mt-1">
                    <span className="text-xs font-bold text-autheo-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200">Secure Access</h4>
                    <p className="text-sm text-slate-400">Recipients get secure, time-limited access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <RecordShareManager />
        </TabsContent>

        <TabsContent value="identity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelfSovereignIdentity />
            <ZeroKnowledgeVerification />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityTab;
