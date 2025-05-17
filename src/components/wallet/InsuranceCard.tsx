
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InsuranceForm, { InsuranceFormValues } from './insurance/InsuranceForm';
import InsuranceDisplay from './insurance/InsuranceDisplay';
import InsuranceEmpty from './insurance/InsuranceEmpty';
import { InsuranceInfo } from './insurance/types';

const InsuranceCard: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);

  const handleFormSubmit = (values: InsuranceFormValues) => {
    // In a real app, this would send data to your backend
    setInsuranceInfo({
      provider: values.provider,
      memberID: values.memberID,
      groupNumber: values.groupNumber || "",  // Convert optional values to non-optional
      planType: values.planType || "",        // Convert optional values to non-optional
      verified: false,
    });
    setShowForm(false);
    toast({
      title: "Insurance information added",
      description: "Your insurance details have been saved to your wallet.",
    });
  };

  const handleVerify = () => {
    if (insuranceInfo) {
      // In a real app, this would trigger a verification process
      setInsuranceInfo({
        ...insuranceInfo,
        verified: true,
      });
      toast({
        title: "Insurance verified",
        description: "Your insurance information has been verified successfully.",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Insurance information shared",
      description: "Your insurance details have been securely shared with the selected provider.",
    });
  };

  const renderContent = () => {
    if (!insuranceInfo && !showForm) {
      return <InsuranceEmpty onAddInsurance={() => setShowForm(true)} />;
    }
    
    if (showForm) {
      return (
        <InsuranceForm 
          onSubmit={handleFormSubmit} 
          onCancel={() => setShowForm(false)} 
        />
      );
    }
    
    return (
      <InsuranceDisplay 
        insuranceInfo={insuranceInfo!} 
        onEdit={() => setShowForm(true)}
        onVerify={handleVerify}
        onShare={handleShare}
      />
    );
  };

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-2 bg-gradient-to-r from-autheo-primary to-autheo-secondary" />
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-autheo-primary/10">
            <CreditCard className="h-4 w-4 text-autheo-primary" />
          </div>
          <CardTitle className="text-lg">Insurance ID</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Manage your health insurance information securely
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default InsuranceCard;
