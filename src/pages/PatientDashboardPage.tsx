
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import PatientEducationCenter from '@/components/education/PatientEducationCenter';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import TelemedicineInterface from '@/components/telemedicine/TelemedicineInterface';
import AdvancedConsentManagement from '@/components/consent/AdvancedConsentManagement';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useToast } from '@/hooks/use-toast';
import HealthRecordsTab from '@/components/patient-dashboard/HealthRecordsTab';
import SharedRecordsContent from '@/components/patient-dashboard/SharedRecordsContent';
import InsuranceInterface from '@/components/wallet/insurance/InsuranceInterface';
import WalletHeader from '@/components/wallet/WalletHeader';
import InsuranceCard from '@/components/wallet/InsuranceCard';

const PatientDashboardPage = () => {
  const { toggleRecordSharing } = useHealthRecords();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('records');

  const handleToggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };

  const handleShareHealthInfo = () => {
    toast({
      title: "Health information shared",
      description: "Your health information has been shared with the selected healthcare provider.",
    });
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gradient-primary bg-gradient-to-r from-autheo-primary to-autheo-secondary bg-clip-text text-transparent">Welcome to Your Health Dashboard</h1>
        <p className="text-slate-300 max-w-3xl">
          Access your personalized health information, communicate with providers, and manage your healthcare experience all in one place.
        </p>
      </div>
      
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
          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/30">
              <CardHeader>
                <CardTitle>Smart Wallet</CardTitle>
                <CardDescription>
                  Control and manage access to your health records and insurance information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <WalletHeader 
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                  />
                  
                  {activeSection === 'insurance' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <InsuranceInterface />
                      </div>
                      <div className="lg:col-span-1">
                        <InsuranceCard />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                      <div className="lg:col-span-1">
                        <p className="text-sm text-slate-400 mb-4">
                          Select another tab from the wallet header to access different features.
                        </p>
                        <InsuranceCard />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
    </div>
  );
};

export default PatientDashboardPage;
