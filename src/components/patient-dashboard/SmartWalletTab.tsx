
import React from 'react';
import WalletDashboard from '@/components/wallet/WalletDashboard';

interface SmartWalletTabProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SmartWalletTab: React.FC<SmartWalletTabProps> = ({
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="space-y-6">
      <WalletDashboard onSectionChange={onSectionChange} />
    </div>
  );
};

export default SmartWalletTab;
