
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import RevampedDashboardTabs from '@/components/patient-dashboard/RevampedDashboardTabs';

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
        title="My Health Dashboard"
        description="Your personal health management platform with quantum-safe sharing and comprehensive health tracking"
        icon={<Heart className="h-8 w-8 text-autheo-primary" />}
      />
      
      <RevampedDashboardTabs
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
