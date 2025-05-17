
import React, { useState } from 'react';
import { Tab, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PaymentContract from './PaymentContract';
import ClaimsHistory from './ClaimsHistory';
import BlockchainInterface from './BlockchainInterface';

const InsuranceInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('contracts');

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="contracts">Payment Contracts</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contracts" className="mt-4 space-y-4">
          <PaymentContract />
          <PaymentContract 
            initialTerms={{
              insuranceProvider: 'Medicare',
              paymentAmount: 350,
              patientResponsibility: 75,
              dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              serviceName: 'Specialist Consultation',
              claimId: 'CL-123458',
              status: 'approved'
            }}
          />
        </TabsContent>
        
        <TabsContent value="claims" className="mt-4">
          <ClaimsHistory />
        </TabsContent>
        
        <TabsContent value="blockchain" className="mt-4">
          <BlockchainInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceInterface;
