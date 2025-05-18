
import React, { useState } from 'react';
import WalletDashboard from '@/components/wallet/WalletDashboard';

const WalletPage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="container mx-auto py-6">
      <WalletDashboard onSectionChange={handleSectionChange} />
    </div>
  );
};

export default WalletPage;
