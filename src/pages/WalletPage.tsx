
import React, { useState, useEffect } from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletFilters from '@/components/wallet/WalletFilters';
import WalletTabsContainer from '@/components/wallet/WalletTabsContainer';
import WalletInfoAlert from '@/components/wallet/WalletInfoAlert';
import DataVaultCard from '@/components/wallet/DataVaultCard';
import { useToast } from '@/hooks/use-toast';

const WalletPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('records');
  const [sortBy, setSortBy] = useState<'date' | 'provider' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { toggleRecordSharing, summary } = useHealthRecords();
  const { toast } = useToast();
  
  // Get available categories from the summary
  const categories = ['all', ...Object.keys(summary.categories)];
  
  // Determine if wallet has been initialized (example logic, modify as needed)
  const [isWalletInitialized, setIsWalletInitialized] = useState(true);
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleToggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };
  
  useEffect(() => {
    // This would normally check if the wallet is initialized through an API call
    // or other logic, but for now we'll just use the state value
  }, []);

  return (
    <div className="space-y-6">
      <WalletHeader 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onSearchChange={handleSearchChange} 
      />
      
      {!isWalletInitialized && <WalletInfoAlert />}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <WalletFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              categories={categories}
            />
            <WalletTabsContainer 
              handleToggleShare={handleToggleShare}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          <DataVaultCard />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
