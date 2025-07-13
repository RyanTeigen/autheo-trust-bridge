import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PolicyAcknowledgment {
  id: string;
  user_id: string;
  policy_version: string;
  acknowledged_at: string;
  ip_address?: unknown;
  user_agent?: string;
  created_at: string;
}

export const usePolicyAcknowledgment = (policyVersion: string = '1.0') => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [acknowledgmentData, setAcknowledgmentData] = useState<PolicyAcknowledgment | null>(null);

  // Check if user has acknowledged the policy
  const checkAcknowledgment = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .select('*')
        .eq('user_id', user.id)
        .eq('policy_version', policyVersion)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking policy acknowledgment:', error);
        toast({
          title: "Error",
          description: "Failed to check policy status.",
          variant: "destructive"
        });
      } else {
        setAcknowledged(!!data);
        setAcknowledgmentData(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Acknowledge the policy
  const acknowledgePolicy = async (): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to acknowledge the policy.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const userAgent = navigator.userAgent;
      
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .insert({
          user_id: user.id,
          policy_version: policyVersion,
          user_agent: userAgent
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording acknowledgment:', error);
        toast({
          title: "Error",
          description: "Could not record policy acknowledgment.",
          variant: "destructive"
        });
        return false;
      } else {
        setAcknowledged(true);
        setAcknowledgmentData(data);
        toast({
          title: "Policy Acknowledged",
          description: "Thank you for acknowledging our HIPAA compliance policy.",
        });
        return true;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    checkAcknowledgment();
  }, [user?.id, policyVersion]);

  return {
    acknowledged,
    loading,
    acknowledgmentData,
    acknowledgePolicy,
    refetch: checkAcknowledgment
  };
};

// Hook for admins/compliance to view all acknowledgments
export const useAllPolicyAcknowledgments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [acknowledgments, setAcknowledgments] = useState<(PolicyAcknowledgment & { profiles?: any })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAllAcknowledgments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching acknowledgments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch policy acknowledgments.",
          variant: "destructive"
        });
      } else {
        setAcknowledgments(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAcknowledgments();
  }, [user?.id]);

  return {
    acknowledgments,
    loading,
    refetch: fetchAllAcknowledgments
  };
};