
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HealthRecordsList from './HealthRecordsList';

interface WalletTabsContainerProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

const WalletTabsContainer: React.FC<WalletTabsContainerProps> = ({ 
  handleToggleShare, 
  searchQuery,
  selectedCategory
}) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-4 bg-slate-100 dark:bg-slate-800">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          All Records
        </TabsTrigger>
        <TabsTrigger 
          value="shared" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          Shared
        </TabsTrigger>
        <TabsTrigger 
          value="private" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          Private
        </TabsTrigger>
        <TabsTrigger 
          value="recent" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
        >
          Recent
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <HealthRecordsList 
          filter="all" 
          onToggleShare={handleToggleShare} 
          searchQuery={searchQuery}
        />
      </TabsContent>
      
      <TabsContent value="shared" className="mt-0">
        <HealthRecordsList 
          filter="shared" 
          onToggleShare={handleToggleShare}
          searchQuery={searchQuery}
        />
      </TabsContent>
      
      <TabsContent value="private" className="mt-0">
        <HealthRecordsList 
          filter="private" 
          onToggleShare={handleToggleShare}
          searchQuery={searchQuery}
        />
      </TabsContent>
      
      <TabsContent value="recent" className="mt-0">
        <HealthRecordsList 
          filter="recent" 
          onToggleShare={handleToggleShare}
          searchQuery={searchQuery}
        />
      </TabsContent>
    </Tabs>
  );
};

export default WalletTabsContainer;
