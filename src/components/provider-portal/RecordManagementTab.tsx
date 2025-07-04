import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus } from 'lucide-react';
import ProviderRecordForm from '@/components/provider/ProviderRecordForm';
import ProviderRecordsTable from '@/components/provider/ProviderRecordsTable';

const RecordManagementTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Record Management</h2>
        <p className="text-slate-400">
          Create new patient records and view records you've created.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="create" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Record
          </TabsTrigger>
          <TabsTrigger 
            value="view" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            My Records
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6 space-y-6">
          <ProviderRecordForm />
        </TabsContent>
        
        <TabsContent value="view" className="mt-6 space-y-6">
          <ProviderRecordsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordManagementTab;