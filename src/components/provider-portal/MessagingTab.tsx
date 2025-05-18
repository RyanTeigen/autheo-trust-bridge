
import React from 'react';
import ProviderMessaging from '@/components/provider/ProviderMessaging';

const MessagingTab: React.FC = () => {
  return (
    <div className="space-y-6 mt-6">
      <ProviderMessaging isEnhanced={true} />
    </div>
  );
};

export default MessagingTab;
