
import React, { useState } from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/patient-dashboard/DashboardHeader';
import DashboardTabs from '@/components/patient-dashboard/DashboardTabs';

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
      <DashboardHeader />
      
      <DashboardTabs
        handleToggleShare={handleToggleShare}
        handleShareHealthInfo={handleShareHealthInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />
    </div>
  );
};

export default PatientDashboardPage;
