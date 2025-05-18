
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import HealthRecordsList from '@/components/wallet/HealthRecordsList';
import ShareHealthInfoDialog from '@/components/shared-records/ShareHealthInfoDialog';
import AccessManagementTab from '@/components/shared-records/AccessManagementTab';
import { SharedRecord } from '@/components/shared-records/types';
import { useToast } from '@/hooks/use-toast';

interface SharedRecordsContentProps {
  handleShareHealthInfo: () => void;
}

const SharedRecordsContent: React.FC<SharedRecordsContentProps> = ({ handleShareHealthInfo }) => {
  const { toast } = useToast();
  const { toggleRecordSharing } = useHealthRecords();
  const [activeTab, setActiveTab] = useState('access');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shareHealthDialog, setShareHealthDialog] = useState(false);
  
  // Mock data for shared records with correct type enforcement
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([
    {
      id: '1',
      recipientName: 'Dr. Emily Chen',
      recipientType: 'provider',
      sharedDate: '2025-03-01',
      expiryDate: '2025-06-01',
      accessLevel: 'full',
      status: 'active'
    },
    {
      id: '2',
      recipientName: 'City Hospital',
      recipientType: 'organization',
      sharedDate: '2025-02-15',
      expiryDate: '2026-02-15',
      accessLevel: 'limited',
      status: 'active'
    },
    {
      id: '3',
      recipientName: 'Sarah Johnson (Mom)',
      recipientType: 'caregiver',
      sharedDate: '2025-01-10',
      expiryDate: '2025-04-10',
      accessLevel: 'read-only',
      status: 'expired'
    }
  ]);
  
  const handleAddRecord = (newRecordData: Omit<SharedRecord, 'id'>) => {
    const newRecord = {
      ...newRecordData,
      id: (sharedRecords.length + 1).toString(),
    };
    
    setSharedRecords([...sharedRecords, newRecord]);
    
    toast({
      title: "Records shared successfully",
      description: `${newRecordData.recipientName} now has ${newRecordData.accessLevel} access to your records.`,
    });
  };
  
  const handleRevokeAccess = (id: string) => {
    // Ensure we're using the correct literal type when updating status
    const updatedRecords = sharedRecords.map(record => 
      record.id === id ? { ...record, status: 'expired' as const } : record
    );
    
    setSharedRecords(updatedRecords);
    
    toast({
      title: "Access revoked",
      description: "The recipient's access to your records has been revoked.",
    });
  };
  
  const handleToggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
  };
  
  // Get categories for the filter dropdown
  const categories = ['all', 'medication', 'condition', 'lab', 'imaging', 'note', 'visit', 'immunization', 'allergy'];
  
  return (
    <div className="space-y-6">
      {/* Top-level tab system */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="access" className="px-6 data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark">Access Management</TabsTrigger>
          <TabsTrigger value="records" className="px-6 data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark">My Health Records</TabsTrigger>
        </TabsList>
        
        {/* Access Management Tab */}
        <TabsContent value="access" className="mt-0">
          <AccessManagementTab 
            sharedRecords={sharedRecords}
            onAddRecord={handleAddRecord}
            onRevokeAccess={handleRevokeAccess}
          />
        </TabsContent>
        
        {/* Health Records Tab */}
        <TabsContent value="records" className="mt-0">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsContent;
