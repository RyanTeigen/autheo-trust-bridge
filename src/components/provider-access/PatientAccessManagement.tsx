
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, UserCheck, Settings } from 'lucide-react';
import PendingAccessRequests from '@/components/patient-access/PendingAccessRequests';
import AccessManagementTabContent from '@/components/patient-dashboard/shared-records/AccessManagementTabContent';

const PatientAccessManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Management</h2>
        <p className="text-slate-400">
          Manage healthcare provider access to your medical records and review requests.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-b border-slate-700">
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
          >
            <UserCheck className="h-4 w-4 mr-1.5" /> Pending Requests
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
          >
            <Shield className="h-4 w-4 mr-1.5" /> Active Permissions
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
          >
            <Settings className="h-4 w-4 mr-1.5" /> Access Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <PendingAccessRequests />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <AccessManagementTabContent />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="text-center py-8 text-slate-400">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Access settings configuration coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientAccessManagement;
