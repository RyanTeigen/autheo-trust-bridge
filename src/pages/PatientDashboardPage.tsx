
import React, { useState } from 'react';
import DashboardTabs from '@/components/patient-dashboard/DashboardTabs';
import DashboardHeader from '@/components/patient-dashboard/DashboardHeader';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

const PatientDashboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toggleShare, shareHealthInfo } = useHealthRecords();

  console.log('PatientDashboardPage rendering...');

  const handleToggleShare = (id: string, shared: boolean) => {
    toggleShare(id, shared);
  };

  const handleShareHealthInfo = () => {
    shareHealthInfo();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
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
          setActiveSection={setActiveSection}
        />
      </div>
    </div>
  );
};

export default PatientDashboardPage;
