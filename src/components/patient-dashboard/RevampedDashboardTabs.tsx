
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Calendar, Activity, UserCheck, Share2 } from 'lucide-react';
import SimplifiedHealthRecordsTab from './SimplifiedHealthRecordsTab';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import SchedulingTabContent from './SchedulingTabContent';
import HealthTrackerTabContent from './HealthTrackerTabContent';
import AccessRequestsTab from './AccessRequestsTab';
import ActiveSharesList from '@/components/patient/ActiveSharesList';

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
      <TabsList className="bg-slate-800 border-b border-slate-700 grid grid-cols-2 lg:grid-cols-6 w-full">
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
          value="access-requests" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <UserCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Access Requests</span>
        </TabsTrigger>
        <TabsTrigger 
          value="shared-records" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Shared Records</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard">
        <PersonalizedDashboard />
      </TabsContent>
      
      <TabsContent value="records">
        <SimplifiedHealthRecordsTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleToggleShare={handleToggleShare}
        />
      </TabsContent>
      
      <TabsContent value="scheduling">
        <SchedulingTabContent />
      </TabsContent>
      
      <TabsContent value="health-tracker">
        <HealthTrackerTabContent />
      </TabsContent>
      
      <TabsContent value="access-requests">
        <AccessRequestsTab />
      </TabsContent>
      
      <TabsContent value="shared-records">
        <ActiveSharesList />
      </TabsContent>
    </Tabs>
  );
};

export default RevampedDashboardTabs;
