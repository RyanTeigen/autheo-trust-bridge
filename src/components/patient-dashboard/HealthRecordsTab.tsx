
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import WalletTabsContainer from '@/components/wallet/WalletTabsContainer';
import WalletFilters from '@/components/wallet/WalletFilters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

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
      <Card>
        <CardHeader>
          <CardTitle>My Health Records</CardTitle>
          <CardDescription>
            View, manage, and share your health records with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search records..."
                className="pl-9 pr-4 py-2 w-full"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecordsTab;
