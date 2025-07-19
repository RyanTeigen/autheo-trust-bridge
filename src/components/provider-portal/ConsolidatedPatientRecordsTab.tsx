
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Share2, UserCheck, Stethoscope } from 'lucide-react';
import { useProviderPortal } from '@/contexts/ProviderPortalContext';
import SharedRecordsTab from './SharedRecordsTab';
import PatientSearchTab from './PatientSearchTab';
import AccessRequestsTab from './AccessRequestsTab';
import ClinicalRecordsTab from './ClinicalRecordsTab';

const ConsolidatedPatientRecordsTab: React.FC = () => {
  const { patientRecordsSubTab, setPatientRecordsSubTab } = useProviderPortal();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Patient Records Management</h2>
        <p className="text-slate-400">
          Access shared records, search for patients, and manage access requests in one consolidated interface.
        </p>
      </div>

      <Tabs value={patientRecordsSubTab} onValueChange={setPatientRecordsSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="clinical-records" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Clinical Records</span>
          </TabsTrigger>
          <TabsTrigger 
            value="shared-records" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Shared Records</span>
          </TabsTrigger>
          <TabsTrigger 
            value="patient-search" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search Patients</span>
          </TabsTrigger>
          <TabsTrigger 
            value="access-requests" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Access Requests</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinical-records" className="mt-6">
          <ClinicalRecordsTab />
        </TabsContent>
        
        <TabsContent value="shared-records" className="mt-6">
          <SharedRecordsTab />
        </TabsContent>
        
        <TabsContent value="patient-search" className="mt-6">
          <PatientSearchTab />
        </TabsContent>
        
        <TabsContent value="access-requests" className="mt-6">
          <AccessRequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedPatientRecordsTab;
