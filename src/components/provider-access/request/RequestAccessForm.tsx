
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAccessRequestAPI } from '@/hooks/useAccessRequestAPI';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const RequestAccessForm: React.FC = () => {
  const [patientEmail, setPatientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { toast } = useToast();
  const { requestPatientAccess } = useAccessRequestAPI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the patient's email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await requestPatientAccess({ patientEmail: patientEmail.trim() });
      
      if (result.success) {
        toast({
          title: "Access Request Sent",
          description: `Successfully requested access to records for ${patientEmail}`,
        });
        setIsSubmitted(true);
        setPatientEmail('');
      } else {
        // Handle different error types with specific messages
        let errorMessage = result.error || 'Failed to send access request';
        
        if (result.error?.includes('not found')) {
          errorMessage = 'Patient not found with this email address';
        } else if (result.error?.includes('already exists')) {
          errorMessage = 'Access request already exists for this patient';
        } else if (result.error?.includes('permissions')) {
          errorMessage = 'You do not have permission to request patient access';
        }
        
        toast({
          title: "Request Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting patient access:', error);
      toast({
        title: "Network Error",
        description: "Unable to send request. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setPatientEmail('');
  };

  if (isSubmitted) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Request Sent Successfully</h3>
              <p className="text-slate-400 mt-2">
                The patient will be notified of your access request and can approve or deny it from their dashboard.
              </p>
            </div>
            <Button 
              onClick={handleReset}
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Send Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Request Patient Access
        </CardTitle>
        <CardDescription className="text-slate-400">
          Enter the patient's email address to request access to their medical records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientEmail" className="text-slate-300">
              Patient Email Address
            </Label>
            <Input
              id="patientEmail"
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="patient@example.com"
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-autheo-primary"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !patientEmail.trim()}
            className="w-full bg-autheo-primary text-slate-900 hover:bg-autheo-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Send Access Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestAccessForm;
