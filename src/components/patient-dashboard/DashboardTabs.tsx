
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import PatientEducationCenter from '@/components/education/PatientEducationCenter';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import TelemedicineInterface from '@/components/telemedicine/TelemedicineInterface';
import AdvancedConsentManagement from '@/components/consent/AdvancedConsentManagement';
import HealthRecordsTab from '@/components/patient-dashboard/HealthRecordsTab';
import SharedRecordsContent from '@/components/patient-dashboard/SharedRecordsContent';
import SmartWalletTab from '@/components/patient-dashboard/SmartWalletTab';

interface DashboardTabsProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  handleShareHealthInfo: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  handleToggleShare,
  handleShareHealthInfo,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeSection,
  setActiveSection
}) => {
  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <div className="overflow-x-auto pb-1">
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur-sm">
          <CardContent className="p-0">
            <TabsList className="w-full justify-start rounded-none border-b border-slate-700 bg-transparent p-0 overflow-x-auto scrollbar-none min-w-max">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="my-health-records"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                My Health Records
              </TabsTrigger>
              <TabsTrigger
                value="smart-wallet"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Smart Wallet
              </TabsTrigger>
              <TabsTrigger
                value="shared-records"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Shared Records
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Education
              </TabsTrigger>
              <TabsTrigger
                value="messaging"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Secure Messaging
              </TabsTrigger>
              <TabsTrigger
                value="telemedicine"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Telemedicine
              </TabsTrigger>
              <TabsTrigger
                value="consent"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold whitespace-nowrap data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Consent Management
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>
      </div>
      
      <TabsContent value="overview" className="space-y-6 mt-4">
        <PersonalizedDashboard />
      </TabsContent>

      <TabsContent value="my-health-records" className="space-y-6 mt-4">
        <HealthRecordsTab 
          handleToggleShare={handleToggleShare}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="smart-wallet" className="space-y-6 mt-4">
        <SmartWalletTab 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </TabsContent>
      
      <TabsContent value="shared-records" className="space-y-6 mt-4">
        <SharedRecordsContent handleShareHealthInfo={handleShareHealthInfo} />
      </TabsContent>
      
      <TabsContent value="education" className="space-y-6 mt-4">
        <PatientEducationCenter />
      </TabsContent>
      
      <TabsContent value="messaging" className="space-y-6 mt-4">
        <SecureMessaging />
      </TabsContent>
      
      <TabsContent value="telemedicine" className="space-y-6 mt-4">
        <TelemedicineInterface />
      </TabsContent>
      
      <TabsContent value="consent" className="space-y-6 mt-4">
        <AdvancedConsentManagement />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
