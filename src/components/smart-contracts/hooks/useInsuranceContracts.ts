
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SmartContractsService, { InsuranceContract } from '@/services/blockchain/SmartContractsService';

export const useInsuranceContracts = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<InsuranceContract[]>([]);
  const [loading, setLoading] = useState(false);
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
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 31536000000).toISOString()
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
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        expiresAt: new Date(Date.now() + 31536000000).toISOString()
      }
    ];
    setContracts(demoContracts);
  };

  const processAutomaticClaim = async (contractId: string, claimAmount: string, serviceCode: string) => {
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

  return {
    contracts,
    loading,
    processAutomaticClaim,
    createNewContract
  };
};
