
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccessRequestResponse {
  requestId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export const useAccessRequestResponse = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const respondToAccessRequest = async ({ requestId, action, reason }: AccessRequestResponse) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('access-request-response', {
        body: {
          requestId,
          action,
          reason
        }
      });

      if (error) {
        console.error('Error responding to access request:', error);
        toast({
          title: "Error",
          description: "Failed to respond to access request. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      if (!data.success) {
        toast({
          title: "Error", 
          description: data.error || "Failed to respond to access request",
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }

      toast({
        title: "Success",
        description: data.message || `Access request ${action}d successfully`,
      });

      return { success: true, data: data.data };
    } catch (error: any) {
      console.error('Network error responding to access request:', error);
      toast({
        title: "Network Error",
        description: "Unable to respond to access request. Please check your connection.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    respondToAccessRequest,
    loading
  };
};
