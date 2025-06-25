
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Share2, Users, Calendar, Activity, Shield } from 'lucide-react';
import HealthRecordsTab from './HealthRecordsTab';
import QuantumSharingTab from './QuantumSharingTab';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import ProviderAccess from '@/pages/ProviderAccess';
import SchedulingTabContent from './SchedulingTabContent';
import HealthTrackerTabContent from './HealthTrackerTabContent';

interface RevampedDashboardTabsProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  handleShareHealthInfo: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const RevampedDashboardTabs: React.FC<RevampedDashboardTabsProps> = ({
  handleToggleShare,
  handleShareHealthInfo,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeSection,
  setActiveSection,
}) => {
  return (
    <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
      <TabsList className="bg-slate-800 border-b border-slate-700 grid grid-cols-3 lg:grid-cols-6 w-full">
        <TabsTrigger 
          value="dashboard" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="records" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Records</span>
        </TabsTrigger>
        <TabsTrigger 
          value="quantum-sharing" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Sharing</span>
        </TabsTrigger>
        <TabsTrigger 
          value="scheduling" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </TabsTrigger>
        <TabsTrigger 
          value="health-tracker" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Tracker</span>
        </TabsTrigger>
        <TabsTrigger 
          value="provider-access" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Access</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard">
        <PersonalizedDashboard />
      </TabsContent>
      
      <TabsContent value="records">
        <HealthRecordsTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleToggleShare={handleToggleShare}
        />
      </TabsContent>
      
      <TabsContent value="quantum-sharing">
        <QuantumSharingTab
          handleShareHealthInfo={handleShareHealthInfo}
        />
      </TabsContent>
      
      <TabsContent value="scheduling">
        <SchedulingTabContent />
      </TabsContent>
      
      <TabsContent value="health-tracker">
        <HealthTrackerTabContent />
      </TabsContent>
      
      <TabsContent value="provider-access">
        <ProviderAccess />
      </TabsContent>
    </Tabs>
  );
};

export default RevampedDashboardTabs;
