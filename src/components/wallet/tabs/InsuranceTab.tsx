
import React from 'react';
import InsuranceInterface from '../insurance/InsuranceInterface';
import InsuranceCard from '../InsuranceCard';

const InsuranceTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <InsuranceInterface />
      </div>
      <div className="lg:col-span-1">
        <InsuranceCard />
      </div>
    </div>
  );
};

export default InsuranceTab;
