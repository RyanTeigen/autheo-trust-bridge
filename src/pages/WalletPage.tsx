
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import RecordSummary from '@/components/wallet/RecordSummary';
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletFilters from '@/components/wallet/WalletFilters';
import WalletTabsContainer from '@/components/wallet/WalletTabsContainer';
import DataVaultCard from '@/components/wallet/DataVaultCard';
import WalletInfoAlert from '@/components/wallet/WalletInfoAlert';
import DecentralizedFeatures from '@/components/wallet/DecentralizedFeatures';
import InsuranceCard from '@/components/wallet/InsuranceCard';
import InsuranceInterface from '@/components/wallet/insurance/InsuranceInterface';
import { supabase } from '@/integrations/supabase/client';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

const WalletPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'provider' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeWalletTab, setActiveWalletTab] = useState('records');
  const [isLoading, setIsLoading] = useState(false);

  const { 
    healthRecords, 
    toggleRecordSharing, 
    summary 
  } = useHealthRecords();

  // Check for user authentication
  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // For now we won't redirect, but in a real app you might want to require login
        console.log("User not authenticated. Some features may be limited.");
      }
    };
    
    checkUserSession();
  }, []);

  // Filtered and sorted records
  const processedRecords = useMemo(() => {
    let filtered = [...healthRecords];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query) ||
        record.details.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'provider') {
        return sortOrder === 'asc' 
          ? a.provider.localeCompare(b.provider) 
          : b.provider.localeCompare(a.provider);
      } else {
        return sortOrder === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      }
    });
    
    return filtered;
  }, [healthRecords, searchQuery, sortBy, sortOrder, selectedCategory]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(healthRecords.map(record => record.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [healthRecords]);

  const handleToggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
    
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };

  // Handle tab changes in the wallet
  const handleTabChange = (tab: string) => {
    setActiveWalletTab(tab);
  };

  return (
    <div className="space-y-3">
      <WalletHeader activeSection={activeWalletTab} onSectionChange={handleTabChange} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="md:col-span-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2 pt-3 border-b border-slate-100">
            <CardTitle className="text-xl">
              {activeWalletTab === 'records' ? 'Your Health Records' : 
               activeWalletTab === 'insurance' ? 'Insurance Information' :
               activeWalletTab === 'payments' ? 'Payment Contracts & Claims' :
               'Your Health Records'}
            </CardTitle>
            <CardDescription className="text-sm">
              {activeWalletTab === 'records' ? 'Manage your medical history and control sharing preferences' : 
               activeWalletTab === 'insurance' ? 'Securely store and share your insurance information' : 
               activeWalletTab === 'payments' ? 'Manage payment contracts and track claims' :
               'Manage your medical history and control sharing preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-3 pb-3">
            {activeWalletTab === 'records' && (
              <>
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
                />
              </>
            )}
            
            {activeWalletTab === 'insurance' && (
              <div className="py-2">
                <InsuranceCard />
              </div>
            )}
            
            {activeWalletTab === 'payments' && (
              <div className="py-2">
                <InsuranceInterface />
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-3">
          <RecordSummary stats={summary} />
          <WalletInfoAlert />
          <DataVaultCard />
        </div>
      </div>
      
      <div className="mt-4">
        <DecentralizedFeatures />
      </div>
    </div>
  );
};

export default WalletPage;
