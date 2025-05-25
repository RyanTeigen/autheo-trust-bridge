
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Wallet, Share2, Users } from 'lucide-react';
import HealthRecordsTab from './HealthRecordsTab';
import SmartWalletTab from './SmartWalletTab';
import SharedRecordsContent from './SharedRecordsContent';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import ProviderAccess from '@/pages/ProviderAccess';

interface DashboardTabsProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  handleShareHealthInfo: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  handleToggleShare,
  handleShareHealthInfo,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeSection,
  setActiveSection,
}) => {
  return (
    <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
      <TabsList className="bg-slate-800 border-b border-slate-700">
        <TabsTrigger 
          value="dashboard" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          <User className="h-4 w-4 mr-1.5" /> Overview
        </TabsTrigger>
        <TabsTrigger 
          value="records" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          <FileText className="h-4 w-4 mr-1.5" /> Health Records
        </TabsTrigger>
        <TabsTrigger 
          value="wallet" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          <Wallet className="h-4 w-4 mr-1.5" /> Smart Wallet
        </TabsTrigger>
        <TabsTrigger 
          value="shared" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          <Share2 className="h-4 w-4 mr-1.5" /> Shared Records
        </TabsTrigger>
        <TabsTrigger 
          value="provider-access" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          <Users className="h-4 w-4 mr-1.5" /> Provider Access
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard">
        <PersonalizedDashboard />
      </TabsContent>
      
      <TabsContent value="records">
        <HealthRecordsTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleToggleShare={handleToggleShare}
        />
      </TabsContent>
      
      <TabsContent value="wallet">
        <SmartWalletTab />
      </TabsContent>
      
      <TabsContent value="shared">
        <SharedRecordsContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleShareHealthInfo={handleShareHealthInfo}
        />
      </TabsContent>
      
      <TabsContent value="provider-access">
        <ProviderAccess />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
