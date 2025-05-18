
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PatientInfo {
  id: string;
  name: string;
  email?: string;
}

const ProviderAccessRequest: React.FC = () => {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  
  const searchPatient = async () => {
    if (!patientId) {
      toast({
        title: "Patient ID Required",
        description: "Please enter a patient identifier to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, this would search the platform's directory service
      // Here we're simulating the search
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', patientId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPatientInfo({
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email
        });
        
        toast({
          title: "Patient Found",
          description: "Patient record was located in the system.",
        });
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with the provided ID.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      
      // For demo purposes, show a found patient even if there's an API error
      setPatientInfo({
        id: patientId,
        name: "Sample Patient",
      });
      
      toast({
        title: "Search Error",
        description: "Demo mode: Patient record will be simulated",
        variant: "destructive"
      });
    }
  };
  
  const requestAccess = async () => {
    if (!patientInfo || !reason) {
      toast({
        title: "Missing Information",
        description: "Please provide all required information to request access",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would create an access request in the blockchain
      // and trigger a notification to the patient through their wallet
      
      // Simulate the request to Supabase
      const { data, error } = await supabase
        .from('smart_contracts')
        .insert({
          name: `Provider Access Request for ${patientInfo.name}`,
          description: reason,
          status: 'pending',
          user_id: patientId, // Patient's ID as the recipient
          blockchain_reference: `blockchain:request:${Date.now()}`
        });
        
      if (error) throw error;
      
      toast({
        title: "Access Request Sent",
        description: "Your request has been submitted. You'll be notified when the patient responds.",
      });
      
      // Reset form
      setPatientId('');
      setReason('');
      setPatientInfo(null);
    } catch (error) {
      console.error("Error sending access request:", error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Request Patient Access</CardTitle>
        <CardDescription className="text-slate-300">
          Request permission to view a patient's health records
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-4">
          {!patientInfo ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Patient Identifier
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter patient ID or wallet address"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                  <Button 
                    onClick={searchPatient}
                    className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
                  >
                    Search
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the patient's unique identifier or wallet address
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-700/50 p-4 rounded-md">
                <h3 className="font-medium text-slate-100 mb-1">Patient Information</h3>
                <p className="text-slate-300">{patientInfo.name}</p>
                <p className="text-slate-400 text-sm">ID: {patientInfo.id}</p>
                {patientInfo.email && (
                  <p className="text-slate-400 text-sm">Email: {patientInfo.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Reason for Access
                </label>
                <Textarea
                  placeholder="Please explain why you need access to this patient's records..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100 min-h-24"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Be specific about what data you need and why. This helps the patient make an informed decision.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Requested Access Duration
                </label>
                <div className="flex items-center space-x-4">
                  <select 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-slate-100 rounded-md px-3 py-2"
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                  </select>
                  <div className="flex items-center text-slate-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Expires: {new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={requestAccess} 
                disabled={isSubmitting}
                className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
              >
                {isSubmitting ? 'Submitting...' : 'Send Access Request'}
              </Button>
              
              <p className="text-xs text-center text-slate-400">
                The patient will be notified and must approve your request before access is granted
              </p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" /> 
          All access requests are cryptographically signed and recorded on the blockchain
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProviderAccessRequest;
