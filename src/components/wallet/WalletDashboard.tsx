import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Shield, 
  FileText, 
  CreditCard, 
  PiggyBank, 
  Receipt, 
  WalletCards, 
  BadgeDollarSign,
  CircleDollarSign,
  ArrowRightLeft,
  Key,
  Lock
} from 'lucide-react';

import WalletOverview from './WalletOverview';
import InsuranceInterface from './insurance/InsuranceInterface';
import InsuranceCard from './InsuranceCard';
import DistributedStorage from '@/components/decentralized/DistributedStorage';
import SmartContracts from '@/components/decentralized/SmartContracts';
import SelfSovereignIdentity from '@/components/decentralized/SelfSovereignIdentity';
import ZeroKnowledgeVerification from '@/components/decentralized/ZeroKnowledgeVerification';
import DecentralizedStorageInfo from '@/components/decentralized/DecentralizedStorageInfo';
import { useWallet } from '@/hooks/use-wallet';

interface WalletDashboardProps {
  onSectionChange?: (section: string) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ onSectionChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallet, connectMetaMask } = useWallet();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(100);
  
  const handleTransactionDemo = () => {
    toast({
      title: "Transaction Processing",
      description: "Demonstrating secure blockchain transaction...",
    });
    
    setTimeout(() => {
      toast({
        title: "Transaction Complete",
        description: "5 Autheo coins transferred successfully.",
      });
      setBalance(prev => prev - 5);
    }, 1500);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
            <Wallet className="h-6 w-6 text-autheo-dark" />
          </div>
          <div>
            <CardTitle className="text-autheo-primary">Smart Wallet</CardTitle>
            <CardDescription className="text-slate-300">
              Control and manage your health finance and blockchain assets in one place
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="space-y-6">
          {/* Consolidated Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-700 dark:bg-slate-700 mb-6 flex w-full justify-start">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
              >
                <PiggyBank className="h-4 w-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger 
                value="insurance"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
              >
                <CreditCard className="h-4 w-4 mr-2" /> Insurance
              </TabsTrigger>
              <TabsTrigger 
                value="blockchain"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
              >
                <WalletCards className="h-4 w-4 mr-2" /> Blockchain
              </TabsTrigger>
              <TabsTrigger 
                value="autheo"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
              >
                <BadgeDollarSign className="h-4 w-4 mr-2" /> Autheo Coin
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
              >
                <Shield className="h-4 w-4 mr-2" /> Security
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-800/50 border-slate-700/50 col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Autheo Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="mr-4 bg-autheo-primary/20 p-3 rounded-full">
                          <CircleDollarSign className="h-6 w-6 text-autheo-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-autheo-primary">{balance}</div>
                          <div className="text-xs text-slate-400">Autheo Coins</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-xs"
                          onClick={handleTransactionDemo}
                        >
                          <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-slate-700 text-xs hover:bg-slate-700/50"
                        >
                          <PiggyBank className="h-3 w-3 mr-1" /> Add Funds
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <WalletOverview removeBalanceCard={true} />
              </div>
            </TabsContent>
              
            <TabsContent value="insurance">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <InsuranceInterface />
                </div>
                <div className="lg:col-span-1">
                  <InsuranceCard />
                </div>
              </div>
            </TabsContent>
              
            <TabsContent value="blockchain">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DistributedStorage />
                <DecentralizedStorageInfo />
              </div>
            </TabsContent>
              
            <TabsContent value="autheo">
              <SmartContracts />
            </TabsContent>

            <TabsContent value="security">
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
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDashboard;
