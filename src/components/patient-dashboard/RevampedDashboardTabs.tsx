
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Calendar, Activity, Shield, MessageCircle, UserCheck } from 'lucide-react';
import SimplifiedHealthRecordsTab from './SimplifiedHealthRecordsTab';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import SchedulingTabContent from './SchedulingTabContent';
import HealthTrackerTabContent from './HealthTrackerTabContent';
import PrivacySecurityTab from './PrivacySecurityTab';
import PatientMessaging from '@/components/patient/PatientMessaging';
import EnhancedAccessRequestsTab from './EnhancedAccessRequestsTab';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

  // Handle navigation state from quick actions
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveSection(location.state.activeTab);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setActiveSection]);

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
          <span className="hidden sm:inline">My Records</span>
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
          value="privacy-security" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Privacy & Security</span>
        </TabsTrigger>
        <TabsTrigger 
          value="messages" 
          className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
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
      
      <TabsContent value="privacy-security">
        <PrivacySecurityTab />
      </TabsContent>
      
      
      <TabsContent value="messages">
        <PatientMessaging />
      </TabsContent>
    </Tabs>
  );
};

export default RevampedDashboardTabs;
