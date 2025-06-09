
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DashboardTabs from '@/components/patient-dashboard/DashboardTabs';

const PatientDashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleToggleShare = (id: string, shared: boolean) => {
    console.log('Toggle share for record:', id, 'to', shared);
    // Implementation would go here
  };

  const handleShareHealthInfo = () => {
    console.log('Share health info');
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Health"
        description="Your comprehensive health dashboard with records, tracking, scheduling, and more"
        icon={<Heart className="h-8 w-8 text-autheo-primary" />}
      />
      
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
  );
};

export default PatientDashboardPage;
