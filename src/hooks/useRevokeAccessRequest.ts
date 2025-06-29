
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRevokeAccessRequest = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const revokeAccessRequest = async (requestId: string) => {
    setLoading(true);
    try {
      console.log('Revoking access request:', requestId);

      const { data, error } = await supabase.functions.invoke('revoke-access-request', {
        body: { requestId }
      });

      if (error) {
        console.error('Error revoking access request:', error);
        throw new Error(error.message || 'Failed to revoke access request');
      }

      if (!data?.success) {
        throw new Error('Failed to revoke access request');
      }

      toast({
        title: "Access Revoked",
        description: "The access request has been successfully revoked.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error in revokeAccessRequest:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access request",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    revokeAccessRequest,
    loading
  };
};
