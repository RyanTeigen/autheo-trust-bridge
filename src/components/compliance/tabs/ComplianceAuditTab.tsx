
import React from 'react';
import { AuditLogTable } from '@/components/compliance/AuditLogTable';
import BlockchainAuditTrail from '@/components/compliance/audit-trail/BlockchainAuditTrail';

const ComplianceAuditTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Audit & Compliance Records</h2>
        <p className="text-slate-300">
          Comprehensive audit logs and immutable compliance records
        </p>
      </div>
      
      <AuditLogTable />
      <BlockchainAuditTrail />
    </div>
  );
};

export default ComplianceAuditTab;
