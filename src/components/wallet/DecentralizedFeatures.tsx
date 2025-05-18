
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, FileCode } from 'lucide-react';
import SmartContracts from '@/components/decentralized/SmartContracts';
import ZeroKnowledgeVerification from '@/components/decentralized/ZeroKnowledgeVerification';
import SelfSovereignIdentity from '@/components/decentralized/SelfSovereignIdentity';
import DistributedStorage from '@/components/decentralized/DistributedStorage';

const DecentralizedFeatures = () => {
  const [activeTab, setActiveTab] = useState('verification');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'verification':
        return <Shield className="h-4 w-4 mr-1.5" />;
      case 'identity':
        return <FileCode className="h-4 w-4 mr-1.5" />;
      case 'storage':
        return <Database className="h-4 w-4 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="verification" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-3 rounded-lg bg-slate-800 border border-slate-700">
          <TabsTrigger 
            value="verification" 
            className="rounded-md data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 text-sm py-1.5 flex items-center justify-center"
          >
            {getTabIcon('verification')}
            <span className="hidden sm:inline">Zero Knowledge</span>
            <span className="sm:hidden">ZK</span>
          </TabsTrigger>
          <TabsTrigger 
            value="identity" 
            className="rounded-md data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 text-sm py-1.5 flex items-center justify-center"
          >
            {getTabIcon('identity')}
            <span className="hidden sm:inline">Identity</span>
            <span className="sm:hidden">ID</span>
          </TabsTrigger>
          <TabsTrigger 
            value="storage" 
            className="rounded-md data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 text-sm py-1.5 flex items-center justify-center"
          >
            {getTabIcon('storage')}
            <span className="hidden sm:inline">Storage</span>
            <span className="sm:hidden">Store</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="verification" className="mt-0 border rounded-lg border-slate-700 bg-slate-800/50">
          <ZeroKnowledgeVerification />
        </TabsContent>
        
        <TabsContent value="identity" className="mt-0 border rounded-lg border-slate-700 bg-slate-800/50">
          <SelfSovereignIdentity />
        </TabsContent>
        
        <TabsContent value="storage" className="mt-0 border rounded-lg border-slate-700 bg-slate-800/50">
          <DistributedStorage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DecentralizedFeatures;
