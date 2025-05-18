
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ListFilter, Clock, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedHealthRecordsFilter from './EnhancedHealthRecordsFilter';
import HealthRecordsTimeline from './HealthRecordsTimeline';
import WalletTabsContainer from '@/components/wallet/WalletTabsContainer';
import ShareHealthInfoDialog from '@/components/shared-records/ShareHealthInfoDialog';
import HealthRecordsStats from './HealthRecordsStats';
import { filterHealthRecords } from '@/utils/healthRecordUtils';

const ImprovedHealthRecordsView: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timeline' | 'list'>('timeline');
  const [shareHealthDialog, setShareHealthDialog] = useState(false);
  
  const { healthRecords, toggleRecordSharing, summary } = useHealthRecords();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [sharedFilter, setSharedFilter] = useState<'all' | 'shared' | 'private'>('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  
  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    return ['all', ...Object.keys(summary.categories)];
  }, [summary.categories]);
  
  // Get unique providers for the filter dropdown
  const providers = useMemo(() => {
    const providerSet = new Set(healthRecords.map(record => record.provider));
    return Array.from(providerSet);
  }, [healthRecords]);

  // Filter the records based on current filter settings
  const filteredRecords = useMemo(() => {
    return filterHealthRecords(healthRecords, {
      searchQuery,
      category: selectedCategory,
      dateRange,
      sharedFilter,
      provider: selectedProvider
    });
  }, [healthRecords, searchQuery, selectedCategory, dateRange, sharedFilter, selectedProvider]);

  const handleToggleShare = (id: string, shared: boolean) => {
    // Toggle record sharing status
    toggleRecordSharing(id, shared);
    
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };
  
  const handleShareHealthInfo = () => {
    setShareHealthDialog(false);
    
    toast({
      title: "Health information shared",
      description: "Your health information has been shared with the selected healthcare provider.",
    });
  };
  
  const handleNavigateToShared = () => {
    navigate('/shared-records');
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-autheo-primary">My Health Records</CardTitle>
            <CardDescription className="text-slate-300">
              View, manage, and share your complete medical history
            </CardDescription>
          </div>
          <div className="flex gap-2 self-end md:self-auto">
            <ShareHealthInfoDialog 
              open={shareHealthDialog} 
              onOpenChange={setShareHealthDialog}
              onSubmit={handleShareHealthInfo}
            />
            
            <Button 
              onClick={() => setShareHealthDialog(true)} 
              variant="outline"
              className="gap-1.5 border-autheo-primary/30 bg-slate-800 text-autheo-primary hover:bg-slate-700"
            >
              <Share className="h-4 w-4" />
              Share Records
            </Button>
            
            <Button
              onClick={handleNavigateToShared}
              className="gap-1.5 bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              Manage Access
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-5 space-y-6">
          {/* Statistics Panel */}
          <HealthRecordsStats />
          
          {/* Enhanced filters */}
          <EnhancedHealthRecordsFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            dateRange={dateRange}
            setDateRange={setDateRange}
            sharedFilter={sharedFilter}
            setSharedFilter={setSharedFilter}
            providers={providers}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
          />
          
          {/* Results count */}
          <div className="text-sm text-slate-300">
            Showing {filteredRecords.length} of {healthRecords.length} records
          </div>
          
          {/* View toggle - Timeline vs List */}
          <Tabs value={activeTab} onValueChange={(value: 'timeline' | 'list') => setActiveTab(value)} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-slate-700">
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex gap-1.5"
                >
                  <Clock className="h-4 w-4" /> Timeline View
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex gap-1.5"
                >
                  <ListFilter className="h-4 w-4" /> List View
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Timeline view */}
            <TabsContent value="timeline" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
              <HealthRecordsTimeline />
            </TabsContent>
            
            {/* List view (using existing component) */}
            <TabsContent value="list" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
              <WalletTabsContainer 
                handleToggleShare={handleToggleShare}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprovedHealthRecordsView;
