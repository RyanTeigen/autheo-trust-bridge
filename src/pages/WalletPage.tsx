
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
  const { toggleRecordSharing } = useHealthRecords();
  const { toast } = useToast();
  
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
      <WalletHeader onSearchChange={handleSearchChange} />
      
      {!isWalletInitialized && <WalletInfoAlert />}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <WalletFilters />
            <WalletTabsContainer 
              handleToggleShare={handleToggleShare}
              searchQuery={searchQuery}
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
