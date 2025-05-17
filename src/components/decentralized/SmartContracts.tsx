
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SmartContract {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'expired';
  expiresAt?: string;
}

const SmartContracts = () => {
  const { toast } = useToast();
  // In a real implementation, this would come from the blockchain
  const [contracts, setContracts] = useState<SmartContract[]>([
    {
      id: 'contract1',
      name: 'Primary Care Access',
      description: 'Grants Dr. Emily Chen access to your medical records',
      status: 'active',
      expiresAt: '2025-06-30'
    },
    {
      id: 'contract2',
      name: 'Insurance Verification',
      description: 'Allows verification of insurance status without exposing details',
      status: 'active',
      expiresAt: '2025-12-31'
    },
    {
      id: 'contract3',
      name: 'Research Data Sharing',
      description: 'Anonymized data sharing for clinical research',
      status: 'pending'
    }
  ]);
  
  const handleActivate = (id: string) => {
    setContracts(contracts.map(contract => 
      contract.id === id ? { ...contract, status: 'active' } : contract
    ));
    
    toast({
      title: "Smart Contract Activated",
      description: "The contract is now active on the blockchain",
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-500 border-red-500">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCode className="mr-2 h-5 w-5 text-primary" /> 
          Smart Contracts
        </CardTitle>
        <CardDescription>
          Automated agreements that govern how your health data is accessed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{contract.name}</h3>
                {getStatusBadge(contract.status)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
              {contract.expiresAt && (
                <div className="text-xs text-muted-foreground">
                  Expires: {new Date(contract.expiresAt).toLocaleDateString()}
                </div>
              )}
              {contract.status === 'pending' && (
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleActivate(contract.id)}
                  >
                    Activate Contract
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => 
          toast({
            title: "Feature in Development",
            description: "Create custom smart contracts feature coming soon",
          })
        }>
          Create New Contract
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SmartContracts;
