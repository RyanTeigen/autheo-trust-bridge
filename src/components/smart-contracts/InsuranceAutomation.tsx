
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useInsuranceContracts } from './hooks/useInsuranceContracts';
import QuickClaimProcessor from './QuickClaimProcessor';
import InsuranceContractsList from './InsuranceContractsList';

const InsuranceAutomation: React.FC = () => {
  const {
    contracts,
    loading,
    processAutomaticClaim,
    createNewContract
  } = useInsuranceContracts();

  const handleProcessClaim = async (contractId: string) => {
    // This would typically open a form or use default values
    // For now, we'll use the quick claim processor values
    console.log(`Processing claim for contract ${contractId}`);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-autheo-primary flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Insurance Smart Contracts
            </CardTitle>
            <CardDescription className="text-slate-300">
              Automated insurance processing and claim management
            </CardDescription>
          </div>
          <Button 
            onClick={createNewContract}
            disabled={loading}
            className="bg-autheo-primary hover:bg-autheo-primary/90"
          >
            Create Contract
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <QuickClaimProcessor
          onProcessClaim={processAutomaticClaim}
          contractId={contracts.length > 0 ? contracts[0].id : undefined}
          loading={loading}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-100">Active Contracts</h3>
          <InsuranceContractsList
            contracts={contracts}
            onProcessClaim={handleProcessClaim}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InsuranceAutomation;
