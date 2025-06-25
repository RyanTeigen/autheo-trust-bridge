
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ShareHealthInfoDialog from '@/components/shared-records/ShareHealthInfoDialog';
import SecurityFeaturesGrid from './shared-records/SecurityFeaturesGrid';
import HeaderCard from './shared-records/HeaderCard';
import TabsNavigation from './shared-records/TabsNavigation';
import OverviewTabContent from './shared-records/OverviewTabContent';
import AccessManagementTabContent from './shared-records/AccessManagementTabContent';
import QuantumSharingTabContent from './shared-records/QuantumSharingTabContent';
import StandardSharingTabContent from './shared-records/StandardSharingTabContent';

const SharedRecordsTab: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [shareHealthDialog, setShareHealthDialog] = useState(false);

  const handleShareHealthInfo = () => {
    setShareHealthDialog(false);
    toast({
      title: "Health Information Shared",
      description: "Your health information has been shared securely using quantum-safe encryption.",
    });
  };

  const handleQuickShare = () => {
    setShareHealthDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <HeaderCard onQuickShare={handleQuickShare} />

      {/* Security Features */}
      <SecurityFeaturesGrid />

      {/* Share Health Info Dialog */}
      <ShareHealthInfoDialog 
        open={shareHealthDialog} 
        onOpenChange={setShareHealthDialog}
        onSubmit={handleShareHealthInfo}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsNavigation />

        <TabsContent value="overview">
          <OverviewTabContent handleShareHealthInfo={handleShareHealthInfo} />
        </TabsContent>

        <TabsContent value="access-management">
          <AccessManagementTabContent />
        </TabsContent>

        <TabsContent value="quantum-sharing">
          <QuantumSharingTabContent />
        </TabsContent>

        <TabsContent value="standard-sharing">
          <StandardSharingTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsTab;
