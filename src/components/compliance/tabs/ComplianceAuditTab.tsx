
import React from 'react';
import { AuditLogTable } from '@/components/compliance/AuditLogTable';
import BlockchainAuditTrail from '@/components/compliance/audit-trail/BlockchainAuditTrail';
import RealBlockchainAuditManager from '@/components/compliance/audit-trail/RealBlockchainAuditManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ComplianceAuditTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Audit & Compliance Records</h2>
        <p className="text-slate-300">
          Comprehensive audit logs and immutable compliance records with real blockchain integration
        </p>
      </div>
      
      <AuditLogTable />
      
      <Tabs defaultValue="real-blockchain" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="real-blockchain" className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
            Real Blockchain Anchoring
          </TabsTrigger>
          <TabsTrigger value="simulated" className="text-slate-300 data-[state=active]:bg-slate-700">
            Simulated Anchoring
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="real-blockchain" className="space-y-6">
          <RealBlockchainAuditManager 
            useMainnet={false} // Set to true for mainnet
            onHashAnchored={() => window.location.reload()} 
          />
        </TabsContent>
        
        <TabsContent value="simulated" className="space-y-6">
          <BlockchainAuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceAuditTab;
