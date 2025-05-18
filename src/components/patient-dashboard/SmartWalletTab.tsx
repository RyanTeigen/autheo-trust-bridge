
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletHeader from '@/components/wallet/WalletHeader';
import InsuranceInterface from '@/components/wallet/insurance/InsuranceInterface';
import InsuranceCard from '@/components/wallet/InsuranceCard';
import DistributedStorage from '@/components/decentralized/DistributedStorage';
import SmartContracts from '@/components/decentralized/SmartContracts';
import { PiggyBank, Receipt, WalletCards, BadgeDollarSign } from 'lucide-react';
import WalletOverview from '@/components/wallet/WalletOverview';

interface SmartWalletTabProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SmartWalletTab: React.FC<SmartWalletTabProps> = ({
  activeSection,
  onSectionChange
}) => {
  const [activeWalletTab, setActiveWalletTab] = useState('overview');
  
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary">Smart Wallet</CardTitle>
          <CardDescription className="text-slate-300">
            Control and manage your health finance and blockchain assets in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-6">
            <WalletHeader 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
            
            <Tabs value={activeWalletTab} onValueChange={setActiveWalletTab} className="w-full">
              <TabsList className="bg-slate-700 dark:bg-slate-700 mb-6">
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
                  <Receipt className="h-4 w-4 mr-2" /> Insurance
                </TabsTrigger>
                <TabsTrigger 
                  value="blockchain"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
                >
                  <WalletCards className="h-4 w-4 mr-2" /> Blockchain
                </TabsTrigger>
                <TabsTrigger 
                  value="currency"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
                >
                  <BadgeDollarSign className="h-4 w-4 mr-2" /> Autheo Coin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <WalletOverview />
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
                  <div className="flex flex-col space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700/50 text-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-autheo-primary">Data Integrity</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs">
                        Your medical data checksums are verified every 24 hours to ensure integrity and detect tampering.
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700/50 text-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-autheo-primary">Key Recovery</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs">
                        Your access keys are securely stored with multi-factor authentication protection.
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="currency">
                <SmartContracts />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartWalletTab;
