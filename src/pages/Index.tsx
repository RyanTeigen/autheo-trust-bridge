import React from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import KeyMetrics from '@/components/dashboard/KeyMetrics';
import QuickActions from '@/components/dashboard/QuickActions';
import HealthRecordsSummary from '@/components/dashboard/HealthRecordsSummary';
import ApprovedAccess from '@/components/dashboard/ApprovedAccess';

// New decentralized components
import DistributedStorage from '@/components/decentralized/DistributedStorage';
import SmartContracts from '@/components/decentralized/SmartContracts';
import ZeroKnowledgeVerification from '@/components/decentralized/ZeroKnowledgeVerification';
import InteroperabilityStandards from '@/components/decentralized/InteroperabilityStandards';
import SelfSovereignIdentity from '@/components/decentralized/SelfSovereignIdentity';

const Index = () => {
  // Sample data for the approved providers
  const approvedProviders = [
    {
      id: "provider1",
      name: "Dr. Sarah Johnson",
      role: "Primary Care Physician",
      accessLevel: "Full",
      grantedOn: "2024-12-01",
      expiresOn: "2025-12-01",
      dataCategories: ["Medications", "Conditions", "Labs", "Allergies"]
    },
    {
      id: "provider2",
      name: "Dr. James Wilson",
      role: "Cardiologist",
      accessLevel: "Limited",
      grantedOn: "2025-01-15",
      expiresOn: "2025-04-15",
      dataCategories: ["Medications", "Labs"]
    }
  ];
  
  // Sample data for health records
  const healthRecords = {
    total: 24,
    shared: 8,
    pending: 2
  };
  
  // Sample health record items
  const recordItems = [
    {
      title: "Annual Physical",
      provider: "Dr. Sarah Johnson",
      date: "2025-02-15"
    },
    {
      title: "Blood Work Results",
      provider: "Metro Lab Services",
      date: "2025-01-28"
    },
    {
      title: "Cardiology Consult",
      provider: "Dr. James Wilson",
      date: "2024-12-10"
    }
  ];
  
  // Sample compliance score
  const complianceScore = 98;
  
  return (
    <div className="container px-4 py-6 space-y-6">
      <PageHeader
        title="Decentralized Health Dashboard"
        description="Secure, patient-owned medical records with blockchain-enabled privacy"
      />

      {/* First Row: Key Metrics */}
      <div>
        <KeyMetrics 
          healthRecords={healthRecords} 
          complianceScore={complianceScore}
        />
      </div>

      {/* Second Row: Quick Actions */}
      <div>
        <QuickActions />
      </div>
      
      {/* Third Row: Access and Records with equal sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-full">
          <ApprovedAccess providers={approvedProviders} />
        </div>
        <div className="h-full">
          <HealthRecordsSummary records={recordItems} />
        </div>
      </div>
      
      {/* Decentralized Features Section - Better balanced grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight border-l-4 border-autheo-primary pl-3">
          Decentralized Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelfSovereignIdentity />
          <ZeroKnowledgeVerification />
          <DistributedStorage />
        </div>
      </div>
      
      {/* Last Row: Equal width columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartContracts />
        <InteroperabilityStandards />
      </div>
    </div>
  );
};

export default Index;
