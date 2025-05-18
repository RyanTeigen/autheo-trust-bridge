
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock } from 'lucide-react';
import { PatientInfo } from './PatientSearch';

interface AccessRequestFormProps {
  patientInfo: PatientInfo;
  onRequestComplete: () => void;
}

const AccessRequestForm: React.FC<AccessRequestFormProps> = ({ patientInfo, onRequestComplete }) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestAccess = async () => {
    if (!reason) {
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
          user_id: patientInfo.id, // Patient's ID as the recipient
          blockchain_reference: `blockchain:request:${Date.now()}`
        });
        
      if (error) throw error;
      
      toast({
        title: "Access Request Sent",
        description: "Your request has been submitted. You'll be notified when the patient responds.",
      });
      
      onRequestComplete();
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
    <>
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
  );
};

export default AccessRequestForm;
