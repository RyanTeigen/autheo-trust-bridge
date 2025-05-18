
import React, { useState } from 'react';
import { HealthRecordsProvider } from '@/contexts/HealthRecordsContext';
import WalletDashboard from '@/components/wallet/WalletDashboard';

const WalletPage = () => {
  const [activeSection, setActiveSection] = useState('records');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <HealthRecordsProvider>
      <div className="container mx-auto py-6">
        <WalletDashboard onSectionChange={handleSectionChange} />
      </div>
    </HealthRecordsProvider>
  );
};

export default WalletPage;
