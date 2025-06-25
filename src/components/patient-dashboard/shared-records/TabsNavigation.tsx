
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Settings, Shield, Share2 } from 'lucide-react';

const TabsNavigation: React.FC = () => {
  return (
    <TabsList className="bg-slate-700 mb-6">
      <TabsTrigger 
        value="overview"
        className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
      >
        <FileText className="h-4 w-4 mr-2" />
        Overview
      </TabsTrigger>
      <TabsTrigger 
        value="access-management"
        className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
      >
        <Settings className="h-4 w-4 mr-2" />
        Access Control
      </TabsTrigger>
      <TabsTrigger 
        value="quantum-sharing"
        className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
      >
        <Shield className="h-4 w-4 mr-2" />
        Quantum Sharing
      </TabsTrigger>
      <TabsTrigger 
        value="standard-sharing"
        className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Standard Sharing
      </TabsTrigger>
    </TabsList>
  );
};

export default TabsNavigation;
