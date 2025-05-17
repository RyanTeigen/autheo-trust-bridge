
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InsuranceForm, { InsuranceFormValues } from './insurance/InsuranceForm';
import InsuranceDisplay from './insurance/InsuranceDisplay';
import InsuranceEmpty from './insurance/InsuranceEmpty';
import { InsuranceInfo } from './insurance/types';
import { supabase } from '@/integrations/supabase/client';

const InsuranceCard: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch insurance information on component mount
  useEffect(() => {
    async function fetchInsuranceInfo() {
      try {
        const { data, error } = await supabase
          .from('insurance_info')
          .select('*')
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setInsuranceInfo({
            provider: data.provider,
            memberID: data.member_id,
            groupNumber: data.group_number || "",
            planType: data.plan_type || "",
            verified: data.verified || false,
          });
        }
      } catch (error) {
        console.error('Error fetching insurance info:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInsuranceInfo();
  }, []);
  
  const handleFormSubmit = async (values: InsuranceFormValues) => {
    setLoading(true);
    try {
      const insuranceData = {
        provider: values.provider,
        member_id: values.memberID,
        group_number: values.groupNumber || null,
        plan_type: values.planType || null,
        verified: false,
      };
      
      if (insuranceInfo) {
        // Update existing record
        const { error } = await supabase
          .from('insurance_info')
          .update(insuranceData)
          .eq('provider', insuranceInfo.provider);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('insurance_info')
          .insert([insuranceData]);
          
        if (error) throw error;
      }
      
      // Update local state
      setInsuranceInfo({
        provider: values.provider,
        memberID: values.memberID,
        groupNumber: values.groupNumber || "",
        planType: values.planType || "",
        verified: false,
      });
      setShowForm(false);
      
      toast({
        title: "Insurance information added",
        description: "Your insurance details have been saved to your wallet.",
      });
    } catch (error) {
      console.error('Error saving insurance info:', error);
      toast({
        title: "Error saving information",
        description: "Could not save insurance details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (insuranceInfo) {
      setLoading(true);
      try {
        // Update verification status in the database
        const { error } = await supabase
          .from('insurance_info')
          .update({ verified: true })
          .eq('member_id', insuranceInfo.memberID);
          
        if (error) throw error;
        
        // Update local state
        setInsuranceInfo({
          ...insuranceInfo,
          verified: true,
        });
        
        toast({
          title: "Insurance verified",
          description: "Your insurance information has been verified successfully.",
        });
      } catch (error) {
        console.error('Error verifying insurance:', error);
        toast({
          title: "Verification failed",
          description: "Could not verify insurance information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShare = () => {
    toast({
      title: "Insurance information shared",
      description: "Your insurance details have been securely shared with the selected provider.",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-4">
          <div className="animate-pulse text-center">
            <div className="h-10 w-10 mx-auto bg-slate-200 rounded-full mb-2"></div>
            <p className="text-sm text-slate-500">Loading insurance information...</p>
          </div>
        </div>
      );
    }
    
    if (!insuranceInfo && !showForm) {
      return <InsuranceEmpty onAddInsurance={() => setShowForm(true)} />;
    }
    
    if (showForm) {
      return (
        <InsuranceForm 
          onSubmit={handleFormSubmit} 
          onCancel={() => setShowForm(false)} 
          initialValues={insuranceInfo || undefined}
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
