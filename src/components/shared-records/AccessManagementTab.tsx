
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search shared records..." 
            className="pl-8 bg-slate-800/60 dark:bg-slate-800/60 border-slate-700 dark:border-slate-700" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <ShareRecordsDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onSubmit={handleSubmit}
        />
        
        <Button onClick={() => setDialogOpen(true)} className="bg-autheo-primary hover:bg-autheo-primary/90 text-gray-900">
          <Plus className="h-4 w-4 mr-1" />
          Share New Records
        </Button>
      </div>
      
      <Tabs defaultValue="active" className="w-full mt-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px] bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="active" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark">
            Active
            {activeRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeRecords.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark">
            Pending
            {pendingRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingRecords.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark">
            Expired
            {expiredRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">{expiredRecords.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {activeRecords.length > 0 ? (
            activeRecords.map(record => (
              <SharedRecordCard 
                key={record.id} 
                record={record} 
                onRevokeAccess={onRevokeAccess} 
              />
            ))
          ) : (
            <EmptyStateCard type="active" onCreateNew={() => setDialogOpen(true)} />
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {pendingRecords.length > 0 ? (
            pendingRecords.map(record => (
              <SharedRecordCard 
                key={record.id} 
                record={record} 
                onRevokeAccess={onRevokeAccess} 
              />
            ))
          ) : (
            <EmptyStateCard type="pending" />
          )}
        </TabsContent>
        
        <TabsContent value="expired" className="mt-6">
          {expiredRecords.length > 0 ? (
            expiredRecords.map(record => (
              <SharedRecordCard 
                key={record.id} 
                record={record} 
                onRevokeAccess={onRevokeAccess} 
              />
            ))
          ) : (
            <EmptyStateCard type="expired" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessManagementTab;
