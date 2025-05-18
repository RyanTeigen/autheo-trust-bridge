
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
      <TabsList className="grid grid-cols-4 mb-4 bg-slate-800 border border-slate-700">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
        >
          All Records
        </TabsTrigger>
        <TabsTrigger 
          value="shared" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
        >
          Shared
        </TabsTrigger>
        <TabsTrigger 
          value="private" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
        >
          Private
        </TabsTrigger>
        <TabsTrigger 
          value="recent" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
        >
          Recent
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <HealthRecordsList 
          filter="all" 
          onToggleShare={handleToggleShare} 
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="shared" className="mt-0">
        <HealthRecordsList 
          filter="shared" 
          onToggleShare={handleToggleShare}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="private" className="mt-0">
        <HealthRecordsList 
          filter="private" 
          onToggleShare={handleToggleShare}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="recent" className="mt-0">
        <HealthRecordsList 
          filter="recent" 
          onToggleShare={handleToggleShare}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
    </Tabs>
  );
};

export default WalletTabsContainer;
