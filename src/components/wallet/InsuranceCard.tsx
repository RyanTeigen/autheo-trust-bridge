
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, PlusCircle, Upload, CheckCircle, Users, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface InsuranceInfo {
  provider: string;
  memberID: string;
  groupNumber: string;
  planType: string;
  verified: boolean;
}

const InsuranceCard: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);

  const formSchema = z.object({
    provider: z.string().min(2, { message: "Insurance provider is required" }),
    memberID: z.string().min(2, { message: "Member ID is required" }),
    groupNumber: z.string().optional(),
    planType: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "",
      memberID: "",
      groupNumber: "",
      planType: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
        {!insuranceInfo && !showForm ? (
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500 mb-3 text-center">
              Add your insurance details to streamline check-in at healthcare providers
            </p>
            <Button 
              onClick={() => setShowForm(true)} 
              variant="autheo" 
              className="w-full flex items-center justify-center gap-2 py-1 h-auto"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Insurance Information
            </Button>
          </div>
        ) : showForm ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Insurance Provider</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Blue Cross Blue Shield" className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="memberID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Member ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ABC123456789" className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="groupNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Group Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., GRP12345" className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Plan Type (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., PPO, HMO" className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 pt-1">
                <Button type="submit" variant="autheo" className="flex-1 text-xs py-1 h-auto">
                  Save Information
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-xs py-1 h-auto border-slate-200 hover:bg-slate-50" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{insuranceInfo?.provider}</p>
                  <p className="text-xs text-slate-600">Plan: {insuranceInfo?.planType || "Standard"}</p>
                </div>
                {insuranceInfo?.verified ? (
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Verified
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="text-xs py-1 h-auto border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={handleVerify}
                  >
                    Verify Now
                  </Button>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-500">Member ID</Label>
                    <p className="text-xs font-mono">{insuranceInfo?.memberID}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500">Group #</Label>
                    <p className="text-xs font-mono">{insuranceInfo?.groupNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs h-auto py-1.5 border-slate-200 hover:bg-slate-50"
                onClick={() => setShowForm(true)}
              >
                Edit Details
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-xs h-auto py-1.5 border-autheo-secondary text-autheo-secondary hover:bg-autheo-secondary/5"
                onClick={handleShare}
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Share Info
              </Button>
            </div>
            
            <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
              <Shield className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600">
                Your insurance data is encrypted end-to-end and only shared with your explicit consent
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsuranceCard;
