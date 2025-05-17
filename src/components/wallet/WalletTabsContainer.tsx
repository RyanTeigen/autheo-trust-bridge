
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import HealthRecordsList from '@/components/wallet/HealthRecordsList';
import { useHealthRecords, HealthRecord } from '@/contexts/HealthRecordsContext';

interface WalletTabsContainerProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  searchQuery: string;
}

const WalletTabsContainer: React.FC<WalletTabsContainerProps> = ({
  handleToggleShare,
  searchQuery
}) => {
  const { healthRecords } = useHealthRecords();
  
  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-3 rounded-lg bg-slate-50">
          <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-1.5">
            All Records
          </TabsTrigger>
          <TabsTrigger value="shared" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-1.5">
            Shared
          </TabsTrigger>
          <TabsTrigger value="private" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-1.5">
            Private
          </TabsTrigger>
          <TabsTrigger value="recent" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-1.5">
            Recent
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <HealthRecordsList 
            onToggleShare={handleToggleShare} 
            filter="all" 
          />
        </TabsContent>
        
        <TabsContent value="shared" className="mt-0">
          <HealthRecordsList 
            onToggleShare={handleToggleShare} 
            filter="shared" 
          />
        </TabsContent>
        
        <TabsContent value="private" className="mt-0">
          <HealthRecordsList 
            onToggleShare={handleToggleShare} 
            filter="private" 
          />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <HealthRecordsList 
            onToggleShare={handleToggleShare} 
            filter="recent" 
          />
        </TabsContent>
      </Tabs>
      <div className="flex justify-between mt-3">
        <div className="text-xs text-muted-foreground">
          {healthRecords.length} records found
        </div>
        {healthRecords.length === 0 && searchQuery && (
          <Badge variant="outline">No results for "{searchQuery}"</Badge>
        )}
      </div>
    </>
  );
};

export default WalletTabsContainer;
