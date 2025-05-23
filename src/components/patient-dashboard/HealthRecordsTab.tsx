
import React, { useState } from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import ImprovedHealthRecordsView from '@/components/health-records/ImprovedHealthRecordsView';
import DecentralizedFeatures from '@/components/wallet/DecentralizedFeatures';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import HealthRecordsList from '@/components/wallet/HealthRecordsList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, ListFilter, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<'advanced' | 'list'>('advanced');
  const { healthRecords } = useHealthRecords();
  
  // Get unique categories for the filter dropdown
  const categories = ['all', 'medication', 'condition', 'lab', 'imaging', 'note', 'visit', 'immunization', 'allergy'];
  
  const handleViewDetailedRecords = () => {
    navigate('/my-health-records');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Health Records</h2>
        <Button 
          variant="outline"
          onClick={handleViewDetailedRecords}
          className="flex items-center gap-1.5 border-autheo-primary/30 text-autheo-primary hover:bg-slate-700"
        >
          <FileText className="h-4 w-4" />
          View Detailed Records
        </Button>
      </div>
      
      <Tabs value={viewType} onValueChange={(value: 'advanced' | 'list') => setViewType(value)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-slate-700">
            <TabsTrigger 
              value="advanced" 
              className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex gap-1.5"
            >
              Advanced View
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary flex gap-1.5"
            >
              <ListFilter className="h-4 w-4" /> Basic List
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="advanced" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {/* Improved health records view with consistent styling */}
          <ImprovedHealthRecordsView />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {/* Basic list view with filters */}
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardHeader className="border-b border-slate-700 bg-slate-700/30">
              <CardTitle className="text-autheo-primary">My Health Records</CardTitle>
              <CardDescription className="text-slate-300">
                View and manage your basic health records
              </CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search records..." 
                    className="pl-8 bg-slate-800/60 border-slate-700" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/60 border-slate-700">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <HealthRecordsList 
                onToggleShare={handleToggleShare}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
              />
            </CardContent>
          </Card>
          
          {/* Decentralized Features Section */}
          <Card className="bg-slate-800 border-slate-700 text-slate-100 mt-6">
            <CardHeader className="border-b border-slate-700 bg-slate-700/30">
              <CardTitle className="text-autheo-primary">Decentralized Health Features</CardTitle>
              <CardDescription className="text-slate-300">
                Blockchain-powered security for your health records
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <DecentralizedFeatures />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthRecordsTab;
