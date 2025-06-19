
import React from 'react';
import { Shield } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import QuantumSecurityDashboard from '@/components/security/QuantumSecurityDashboard';

const QuantumSecurityPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quantum Security"
        description="Monitor and verify post-quantum cryptographic security implementations"
        icon={<Shield className="h-8 w-8 text-blue-600" />}
      />
      
      <QuantumSecurityDashboard />
    </div>
  );
};

export default QuantumSecurityPage;
