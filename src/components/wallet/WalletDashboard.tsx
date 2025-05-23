
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wallet, Shield, PiggyBank, CreditCard, WalletCards, BadgeDollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import WalletOverviewTab from './tabs/WalletOverviewTab';
import InsuranceTab from './tabs/InsuranceTab';
import BlockchainTab from './tabs/BlockchainTab';
import AutheoTab from './tabs/AutheoTab';
import SecurityTab from './tabs/SecurityTab';

interface WalletDashboardProps {
  onSectionChange?: (section: string) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ onSectionChange }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

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
              <WalletOverviewTab />
            </TabsContent>
              
            <TabsContent value="insurance">
              <InsuranceTab />
            </TabsContent>
              
            <TabsContent value="blockchain">
              <BlockchainTab />
            </TabsContent>
              
            <TabsContent value="autheo">
              <AutheoTab />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDashboard;
