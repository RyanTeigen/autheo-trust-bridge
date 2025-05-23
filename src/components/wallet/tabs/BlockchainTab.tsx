
import React from 'react';
import DistributedStorage from '@/components/decentralized/DistributedStorage';
import DecentralizedStorageInfo from '@/components/decentralized/DecentralizedStorageInfo';

const BlockchainTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DistributedStorage />
      <DecentralizedStorageInfo />
    </div>
  );
};

export default BlockchainTab;
