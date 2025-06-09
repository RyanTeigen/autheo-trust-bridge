
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

interface QuickClaimProcessorProps {
  onProcessClaim: (contractId: string, claimAmount: string, serviceCode: string) => Promise<void>;
  contractId?: string;
  loading: boolean;
}

const QuickClaimProcessor: React.FC<QuickClaimProcessorProps> = ({
  onProcessClaim,
  contractId,
  loading
}) => {
  const [claimAmount, setClaimAmount] = useState('');
  const [serviceCode, setServiceCode] = useState('');

  const handleProcessClaim = async () => {
    if (contractId && claimAmount && serviceCode) {
      await onProcessClaim(contractId, claimAmount, serviceCode);
      // Reset form after processing
      setClaimAmount('');
      setServiceCode('');
    }
  };

  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Quick Claim Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Claim Amount ($)</label>
            <Input 
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="0.00"
              className="bg-slate-600 border-slate-500 text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Service Code</label>
            <Input 
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              placeholder="e.g., 99213"
              className="bg-slate-600 border-slate-500 text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Process Against</label>
            <Button 
              onClick={handleProcessClaim}
              disabled={loading || !claimAmount || !serviceCode || !contractId}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Auto Process'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickClaimProcessor;
