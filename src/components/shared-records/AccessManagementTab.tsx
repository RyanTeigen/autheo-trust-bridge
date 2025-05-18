
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import SharedRecordCard from './SharedRecordCard';
import EmptyStateCard from './EmptyStateCard';
import ShareRecordsDialog from './ShareRecordsDialog';
import { SharedRecord } from './types';

interface AccessManagementTabProps {
  sharedRecords: SharedRecord[];
  onAddRecord: (record: Omit<SharedRecord, 'id'> & { status: 'active' }) => void;
  onRevokeAccess: (id: string) => void;
}

const AccessManagementTab: React.FC<AccessManagementTabProps> = ({
  sharedRecords,
  onAddRecord,
  onRevokeAccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtered records based on search query
  const filteredRecords = sharedRecords.filter(record => 
    record.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.recipientType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Split records by status
  const activeRecords = filteredRecords.filter(record => record.status === 'active');
  const pendingRecords = filteredRecords.filter(record => record.status === 'pending');
  const expiredRecords = filteredRecords.filter(record => record.status === 'expired');

  const handleSubmit = (values: any) => {
    const newRecord = {
      recipientName: values.recipientName,
      recipientType: values.recipientType,
      sharedDate: new Date().toISOString().slice(0, 10),
      expiryDate: values.expiryDate ? values.expiryDate.toISOString().slice(0, 10) : '',
      accessLevel: values.accessLevel,
      status: 'active' as const
    };
    
    onAddRecord(newRecord);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-autheo-primary">Access Management</CardTitle>
              <CardDescription className="text-slate-300">
                Control who has access to your health records
              </CardDescription>
            </div>
            
            <ShareRecordsDialog 
              open={dialogOpen} 
              onOpenChange={setDialogOpen} 
              onSubmit={handleSubmit}
            />
            
            <Button onClick={() => setDialogOpen(true)} className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark">
              <Plus className="h-4 w-4 mr-1" />
              Share New Records
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search shared records..." 
                className="pl-8 bg-slate-800/60 border-slate-700" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <Tabs defaultValue="active" className="w-full mt-2">
            <TabsList className="grid grid-cols-3 w-full md:w-[400px] bg-slate-700/30 mb-4">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                Active
                {activeRecords.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{activeRecords.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                Pending
                {pendingRecords.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{pendingRecords.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="expired" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                Expired
                {expiredRecords.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{expiredRecords.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-0">
              {activeRecords.length > 0 ? (
                <div className="space-y-4">
                  {activeRecords.map(record => (
                    <SharedRecordCard 
                      key={record.id} 
                      record={record} 
                      onRevokeAccess={onRevokeAccess} 
                    />
                  ))}
                </div>
              ) : (
                <EmptyStateCard type="active" onCreateNew={() => setDialogOpen(true)} />
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              {pendingRecords.length > 0 ? (
                <div className="space-y-4">
                  {pendingRecords.map(record => (
                    <SharedRecordCard 
                      key={record.id} 
                      record={record} 
                      onRevokeAccess={onRevokeAccess} 
                    />
                  ))}
                </div>
              ) : (
                <EmptyStateCard type="pending" />
              )}
            </TabsContent>
            
            <TabsContent value="expired" className="mt-0">
              {expiredRecords.length > 0 ? (
                <div className="space-y-4">
                  {expiredRecords.map(record => (
                    <SharedRecordCard 
                      key={record.id} 
                      record={record} 
                      onRevokeAccess={onRevokeAccess} 
                    />
                  ))}
                </div>
              ) : (
                <EmptyStateCard type="expired" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessManagementTab;
