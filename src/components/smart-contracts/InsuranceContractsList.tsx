
import React from 'react';
import { FileText } from 'lucide-react';
import { InsuranceContract } from '@/services/blockchain/SmartContractsService';
import InsuranceContractCard from './InsuranceContractCard';

interface InsuranceContractsListProps {
  contracts: InsuranceContract[];
  onProcessClaim: (contractId: string) => void;
  loading: boolean;
}

const InsuranceContractsList: React.FC<InsuranceContractsListProps> = ({
  contracts,
  onProcessClaim,
  loading
}) => {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No insurance contracts found</p>
        <p className="text-sm">Create your first smart contract to automate insurance processing</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {contracts.map((contract) => (
        <InsuranceContractCard
          key={contract.id}
          contract={contract}
          onProcessClaim={onProcessClaim}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default InsuranceContractsList;
