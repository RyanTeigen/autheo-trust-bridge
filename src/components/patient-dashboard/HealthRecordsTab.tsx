
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import WalletTabsContainer from '@/components/wallet/WalletTabsContainer';
import WalletFilters from '@/components/wallet/WalletFilters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import DecentralizedFeatures from '@/components/wallet/DecentralizedFeatures';

interface HealthRecordsTabProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({
  handleToggleShare,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  const { summary } = useHealthRecords();
  
  // Get available categories from the summary
  const categories = ['all', ...Object.keys(summary.categories)];
  
  // Sort options for consistency with the wallet page
  const [sortBy, setSortBy] = React.useState<'date' | 'provider' | 'category'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary">My Health Records</CardTitle>
          <CardDescription className="text-slate-300">
            View, manage, and share your health records with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-6">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search records..."
                className="pl-9 pr-4 py-2 w-full bg-slate-900/50 border-slate-700 text-slate-100 focus-visible:ring-autheo-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
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

            {/* Decentralized Features Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-autheo-primary mb-4">Decentralized Health Features</h2>
              <DecentralizedFeatures />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecordsTab;
