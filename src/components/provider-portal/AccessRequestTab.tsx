
import React from 'react';
import ProviderAccessRequest from '@/components/provider-access/ProviderAccessRequest';

const AccessRequestTab: React.FC = () => {
  return (
    <div className="space-y-6 mt-6">
      <ProviderAccessRequest isEnhanced={true} />
    </div>
  );
};

export default AccessRequestTab;
