import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Share,
  Calendar,
  Wallet,
  Plus,
  Search,
  Filter,
  Bell,
  Settings,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardTabContent from './DashboardTabContent';
import PatientRecordsTab from './PatientRecordsTab';
import HealthTrackerTabContent from './HealthTrackerTabContent';
import SharedRecordsContent from './SharedRecordsContent';
import SchedulingTabContent from './SchedulingTabContent';
import SmartWalletTab from './SmartWalletTab';

interface RevampedDashboardTabsProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  handleShareHealthInfo: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
}

const RevampedDashboardTabs: React.FC<RevampedDashboardTabsProps> = ({
  handleToggleShare,
  handleShareHealthInfo,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeSection,
  setActiveSection
}) => {
  const { user } = useAuth();

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'My Records', icon: FileText },
    { id: 'health-tracker', label: 'Health Tracker', icon: Activity },
    { id: 'shared-records', label: 'Shared Records', icon: Share },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'smart-wallet', label: 'Smart Wallet', icon: Wallet }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardTabContent />;
      case 'records':
        return <PatientRecordsTab />;
      case 'health-tracker':
        return <HealthTrackerTabContent />;
      case 'shared-records':
        return (
          <SharedRecordsContent
            handleShareHealthInfo={handleShareHealthInfo}
          />
        );
      case 'scheduling':
        return <SchedulingTabContent />;
      case 'smart-wallet':
        return (
          <SmartWalletTab
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        );
      default:
        return <DashboardTabContent />;
    }
  };

  return (
    <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full space-y-4">
      <TabsList>
        {sections.map((section) => (
          <TabsTrigger key={section.id} value={section.id} className="relative">
            <section.icon className="h-4 w-4 mr-2" />
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="dashboard" className="space-y-4">
        {renderContent()}
      </TabsContent>
      <TabsContent value="records" className="space-y-4">
        {renderContent()}
      </TabsContent>
      <TabsContent value="health-tracker" className="space-y-4">
        {renderContent()}
      </TabsContent>
      <TabsContent value="shared-records" className="space-y-4">
        {renderContent()}
      </TabsContent>
      <TabsContent value="scheduling" className="space-y-4">
        {renderContent()}
      </TabsContent>
      <TabsContent value="smart-wallet" className="space-y-4">
        {renderContent()}
      </TabsContent>
    </Tabs>
  );
};

export default RevampedDashboardTabs;
