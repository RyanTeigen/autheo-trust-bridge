
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Coins, FileCheck, Shield } from 'lucide-react';

export interface PaymentTerms {
  insuranceProvider: string;
  paymentAmount: number;
  patientResponsibility: number;
  dueDate: string;
  serviceName: string;
  claimId: string;
  status: 'pending' | 'approved' | 'denied' | 'paid';
}

interface PaymentContractProps {
  initialTerms?: PaymentTerms;
}

const PaymentContract: React.FC<PaymentContractProps> = ({ initialTerms }) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(!initialTerms);
  const [useBlockchain, setUseBlockchain] = useState(true);
  const [terms, setTerms] = useState<PaymentTerms>(initialTerms || {
    insuranceProvider: 'Blue Cross Blue Shield',
    paymentAmount: 250,
    patientResponsibility: 50,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    serviceName: 'Annual Physical Examination',
    claimId: `CL-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'pending'
  });

  const insuranceProviders = [
    'Blue Cross Blue Shield',
    'UnitedHealthcare',
    'Aetna',
    'Cigna',
    'Kaiser Permanente',
    'Humana',
    'Medicare',
    'Medicaid'
  ];

  const handleChange = (field: keyof PaymentTerms, value: string | number) => {
    setTerms(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (useBlockchain) {
      toast({
        title: "Creating blockchain contract...",
        description: "Initiating a secure blockchain transaction for this payment contract.",
      });
      
      // Simulate blockchain delay
      setTimeout(() => {
        toast({
          title: "Blockchain contract created",
          description: "Payment terms are now recorded on the blockchain and cannot be altered.",
        });
        setEditMode(false);
      }, 1500);
    } else {
      toast({
        title: "Payment contract saved",
        description: "Your payment terms have been saved traditionally.",
      });
      setEditMode(false);
    }
  };

  const approveContract = () => {
    setTerms(prev => ({
      ...prev,
      status: 'approved'
    }));
    
    toast({
      title: "Contract approved",
      description: "The payment contract has been approved by all parties.",
    });
  };

  const executePayment = () => {
    setTerms(prev => ({
      ...prev,
      status: 'paid'
    }));
    
    toast({
      title: "Payment processed",
      description: `Successfully paid $${terms.patientResponsibility} via secure blockchain transfer.`,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-autheo-primary" />
          {editMode ? 'Create Payment Contract' : 'Payment Contract'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {editMode ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Select 
                value={terms.insuranceProvider}
                onValueChange={(value) => handleChange('insuranceProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceProviders.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input 
                id="serviceName"
                value={terms.serviceName}
                onChange={(e) => handleChange('serviceName', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="paymentAmount">Total Amount ($)</Label>
                <Input 
                  id="paymentAmount"
                  type="number"
                  value={terms.paymentAmount}
                  onChange={(e) => handleChange('paymentAmount', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="patientResponsibility">Patient Responsibility ($)</Label>
                <Input 
                  id="patientResponsibility"
                  type="number"
                  value={terms.patientResponsibility}
                  onChange={(e) => handleChange('patientResponsibility', parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate"
                type="date"
                value={terms.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="useBlockchain"
                  checked={useBlockchain}
                  onCheckedChange={setUseBlockchain}
                />
                <Label htmlFor="useBlockchain" className="cursor-pointer">Use blockchain contract</Label>
              </div>
              
              {useBlockchain && (
                <div className="flex items-center text-xs text-green-600">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Enhanced security</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <div className="font-medium">Claim ID:</div>
              <div>{terms.claimId}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="font-medium">Insurance Provider:</div>
              <div>{terms.insuranceProvider}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="font-medium">Service:</div>
              <div>{terms.serviceName}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="font-medium">Total Amount:</div>
              <div>${terms.paymentAmount.toFixed(2)}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="font-medium">Patient Responsibility:</div>
              <div>${terms.patientResponsibility.toFixed(2)}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="font-medium">Insurance Covers:</div>
              <div>${(terms.paymentAmount - terms.patientResponsibility).toFixed(2)}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="font-medium">Due Date:</div>
              <div>{new Date(terms.dueDate).toLocaleDateString()}</div>
            </div>
            
            <div className="flex justify-between mt-2">
              <div className="font-medium">Status:</div>
              <div className={`font-semibold ${
                terms.status === 'approved' ? 'text-amber-600' : 
                terms.status === 'paid' ? 'text-green-600' : 
                terms.status === 'denied' ? 'text-red-600' : 
                'text-slate-600'
              }`}>
                {terms.status.charAt(0).toUpperCase() + terms.status.slice(1)}
              </div>
            </div>
            
            {useBlockchain && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
                <Shield className="h-3 w-3" />
                <span>Secured by quantum-resistant blockchain</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {editMode ? (
          <Button 
            onClick={handleSave} 
            className="w-full bg-autheo-primary hover:bg-autheo-primary/90"
          >
            Save Payment Contract
          </Button>
        ) : (
          <div className="w-full space-y-2">
            {terms.status === 'pending' && (
              <Button 
                onClick={approveContract} 
                className="w-full"
              >
                Approve Contract
              </Button>
            )}
            
            {terms.status === 'approved' && (
              <Button 
                onClick={executePayment} 
                className="w-full flex items-center gap-1.5 bg-autheo-primary hover:bg-autheo-primary/90"
              >
                <Coins className="h-4 w-4" />
                Pay ${terms.patientResponsibility.toFixed(2)} Now
              </Button>
            )}
            
            {terms.status === 'paid' && (
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                disabled
              >
                <FileCheck className="h-4 w-4 mr-1.5" />
                Payment Complete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PaymentContract;
