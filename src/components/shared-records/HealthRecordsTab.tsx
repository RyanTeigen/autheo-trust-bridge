
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Filter } from 'lucide-react';
import HealthRecordsList from '@/components/wallet/HealthRecordsList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShareHealthInfoDialog from './ShareHealthInfoDialog';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

interface HealthRecordsTabProps {
  shareHealthDialog: boolean;
  setShareHealthDialog: (open: boolean) => void;
  handleShareHealthInfo: () => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({
  shareHealthDialog,
  setShareHealthDialog,
  handleShareHealthInfo
}) => {
  const { toggleRecordSharing } = useHealthRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get categories for the filter dropdown
  const categories = ['all', 'medication', 'condition', 'lab', 'imaging', 'note', 'visit', 'immunization', 'allergy'];
  
  const handleToggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-autheo-primary">My Health Information</CardTitle>
              <CardDescription className="text-slate-300">
                View and manage your comprehensive health records
              </CardDescription>
            </div>
            
            <ShareHealthInfoDialog 
              open={shareHealthDialog} 
              onOpenChange={setShareHealthDialog}
              onSubmit={handleShareHealthInfo}
            />
            
            <Button 
              onClick={() => setShareHealthDialog(true)} 
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share Health Info
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-3">
            <div className="relative flex-1">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
    </div>
  );
};

export default HealthRecordsTab;
