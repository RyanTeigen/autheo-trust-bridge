
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileContract, DollarSign, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import SmartContractsService, { InsuranceContract } from '@/services/blockchain/SmartContractsService';

const InsuranceAutomation: React.FC = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<InsuranceContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [serviceCode, setServiceCode] = useState('');
  const smartContractsService = SmartContractsService.getInstance();

  useEffect(() => {
    loadDemoContracts();
  }, []);

  const loadDemoContracts = () => {
    const demoContracts: InsuranceContract[] = [
      {
        id: 'contract-ins-1',
        patientId: 'patient-123',
        providerId: 'provider-456',
        insuranceProvider: 'Blue Cross Blue Shield',
        contractType: 'claim_processing',
        terms: {
          coverageAmount: 10000,
          deductible: 500,
          copayAmount: 25,
          autoApprovalLimit: 500,
          requiresPreAuth: false
        },
        status: 'active',
        blockchainHash: '0x1234567890abcdef',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        expiresAt: new Date(Date.now() + 31536000000).toISOString() // 1 year from now
      },
      {
        id: 'contract-ins-2',
        patientId: 'patient-123',
        providerId: 'provider-789',
        insuranceProvider: 'UnitedHealthcare',
        contractType: 'payment_automation',
        terms: {
          coverageAmount: 15000,
          deductible: 750,
          copayAmount: 50,
          autoApprovalLimit: 1000,
          requiresPreAuth: true
        },
        status: 'active',
        blockchainHash: '0xabcdef1234567890',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        expiresAt: new Date(Date.now() + 31536000000).toISOString()
      }
    ];
    setContracts(demoContracts);
  };

  const handleProcessClaim = async (contractId: string) => {
    if (!claimAmount || !serviceCode) {
      toast({
        title: "Invalid Input",
        description: "Please enter both claim amount and service code.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const result = await smartContractsService.processAutomaticClaim(
        contractId,
        parseFloat(claimAmount),
        serviceCode
      );

      if (result.approved) {
        toast({
          title: "Claim Auto-Approved",
          description: `Payment of $${result.paymentAmount.toFixed(2)} has been processed automatically.`,
        });
      } else {
        toast({
          title: "Manual Review Required",
          description: result.reason || "This claim requires manual review.",
          variant: "destructive"
        });
      }

      // Reset form
      setClaimAmount('');
      setServiceCode('');
    } catch (error) {
      console.error('Error processing claim:', error);
      toast({
        title: "Processing Failed",
        description: "Could not process the claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewContract = async () => {
    try {
      setLoading(true);
      
      const newContract = await smartContractsService.createInsuranceContract({
        patientId: 'patient-123',
        providerId: 'provider-new',
        insuranceProvider: 'Aetna',
        contractType: 'coverage_verification',
        terms: {
          coverageAmount: 8000,
          deductible: 400,
          copayAmount: 30,
          autoApprovalLimit: 300,
          requiresPreAuth: false
        },
        expiresAt: new Date(Date.now() + 31536000000).toISOString()
      });

      setContracts([...contracts, newContract]);
      
      toast({
        title: "Contract Created",
        description: `New insurance contract deployed to blockchain: ${newContract.blockchainHash?.slice(0, 10)}...`,
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Creation Failed",
        description: "Could not create new contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InsuranceContract['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'draft':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
      case 'executed':
        return <Badge className="bg-blue-600">Executed</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getContractTypeIcon = (type: InsuranceContract['contractType']) => {
    switch (type) {
      case 'claim_processing':
        return <FileContract className="h-4 w-4 text-blue-500" />;
      case 'payment_automation':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'authorization':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'coverage_verification':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <FileContract className="h-4 w-4 text-gray-500" />;
    }
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
        {/* Quick Claim Processing */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Quick Claim Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Claim Amount ($)</label>
                <Input 
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Code</label>
                <Input 
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                  placeholder="e.g., 99213"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Process Against</label>
                <Button 
                  onClick={() => contracts.length > 0 && handleProcessClaim(contracts[0].id)}
                  disabled={loading || !claimAmount || !serviceCode}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processing...' : 'Auto Process'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Contracts</h3>
          
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileContract className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insurance contracts found</p>
              <p className="text-sm">Create your first smart contract to automate insurance processing</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {contracts.map((contract) => (
                <Card key={contract.id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getContractTypeIcon(contract.contractType)}
                        <div>
                          <h4 className="font-medium">{contract.insuranceProvider}</h4>
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
                        <p className="font-medium">${contract.terms.coverageAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Deductible</p>
                        <p className="font-medium">${contract.terms.deductible}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Copay</p>
                        <p className="font-medium">${contract.terms.copayAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Auto Approval Limit</p>
                        <p className="font-medium">${contract.terms.autoApprovalLimit}</p>
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
                        onClick={() => handleProcessClaim(contract.id)}
                        disabled={loading || contract.status !== 'active'}
                        className="bg-autheo-primary hover:bg-autheo-primary/90"
                      >
                        Process Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsuranceAutomation;
