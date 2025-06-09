
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Wallet, 
  Shield, 
  CreditCard, 
  Coins, 
  Network,
  FileCode 
} from 'lucide-react';
import WalletOverviewTab from './tabs/WalletOverviewTab';
import SecurityTab from './tabs/SecurityTab';
import InsuranceTab from './tabs/InsuranceTab';
import AutheoTab from './tabs/AutheoTab';
import CrossChainTab from './tabs/CrossChainTab';
import BlockchainTab from './tabs/BlockchainTab';

interface WalletTabsContainerProps {
  onSectionChange?: (section: string) => void;
}

const WalletTabsContainer: React.FC<WalletTabsContainerProps> = ({ onSectionChange }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onSectionChange?.(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="bg-slate-800 dark:bg-slate-800 mb-6 flex w-full justify-start overflow-x-auto">
        <TabsTrigger 
          value="overview"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Wallet className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="cross-chain"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Network className="h-4 w-4" />
          Cross-Chain
        </TabsTrigger>
        <TabsTrigger 
          value="blockchain"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex items-center gap-2 whitespace-nowrap"
        >
          <FileCode className="h-4 w-4" />
          Smart Contracts
        </TabsTrigger>
        <TabsTrigger 
          value="autheo"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Coins className="h-4 w-4" />
          THEO Tokens
        </TabsTrigger>
        <TabsTrigger 
          value="insurance"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex items-center gap-2 whitespace-nowrap"
        >
          <CreditCard className="h-4 w-4" />
          Insurance
        </TabsTrigger>
        <TabsTrigger 
          value="security"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <WalletOverviewTab />
      </TabsContent>
      
      <TabsContent value="cross-chain">
        <CrossChainTab />
      </TabsContent>
      
      <TabsContent value="blockchain">
        <BlockchainTab />
      </TabsContent>
      
      <TabsContent value="autheo">
        <AutheoTab />
      </TabsContent>
      
      <TabsContent value="insurance">
        <InsuranceTab />
      </TabsContent>
      
      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  );
};

export default WalletTabsContainer;
