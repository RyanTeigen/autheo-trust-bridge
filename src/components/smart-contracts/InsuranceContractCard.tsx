
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InsuranceContract } from '@/services/blockchain/SmartContractsService';
import { getStatusBadge, getContractTypeIcon } from './utils/insuranceHelpers';

interface InsuranceContractCardProps {
  contract: InsuranceContract;
  onProcessClaim: (contractId: string) => void;
  loading: boolean;
}

const InsuranceContractCard: React.FC<InsuranceContractCardProps> = ({
  contract,
  onProcessClaim,
  loading
}) => {
  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getContractTypeIcon(contract.contractType)}
            <div>
              <h4 className="font-medium text-slate-100">{contract.insuranceProvider}</h4>
              <p className="text-sm text-slate-400 capitalize">
                {contract.contractType.replace('_', ' ')}
              </p>
              {contract.blockchainHash && (
                <p className="text-xs text-slate-500 font-mono">
                  {contract.blockchainHash.slice(0, 16)}...
                </p>
              )}
            </div>
          </div>
          {getStatusBadge(contract.status)}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-400">Coverage</p>
            <p className="font-medium text-slate-200">${contract.terms.coverageAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Deductible</p>
            <p className="font-medium text-slate-200">${contract.terms.deductible}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Copay</p>
            <p className="font-medium text-slate-200">${contract.terms.copayAmount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Auto Approval Limit</p>
            <p className="font-medium text-slate-200">${contract.terms.autoApprovalLimit}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Created: {new Date(contract.createdAt).toLocaleDateString()}
            {contract.expiresAt && (
              <span className="ml-2">
                • Expires: {new Date(contract.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <Button 
            size="sm" 
            onClick={() => onProcessClaim(contract.id)}
            disabled={loading || contract.status !== 'active'}
            className="bg-autheo-primary hover:bg-autheo-primary/90"
          >
            Process Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsuranceContractCard;
