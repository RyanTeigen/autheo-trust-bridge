
import { supabase } from '@/integrations/supabase/client';

export class FitnessAuditLogger {
  private getClientIP(): string {
    return '127.0.0.1';
  }

  async logFitnessDataAccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    status: 'success' | 'failure' | 'warning' = 'success'
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_audit_logs')
        .insert({
          user_id: user.user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          status,
          compliance_category: 'access',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging fitness data access:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log fitness data access:', error);
    }
  }

  async logDataDisclosure(
    recipient: string,
    purpose: string,
    dataCategories: string[],
    details?: any
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_audit_logs')
        .insert({
          user_id: user.user.id,
          action: `Data disclosed to ${recipient}`,
          resource_type: 'fitness_data_disclosure',
          details: {
            recipient,
            purpose,
            data_categories: dataCategories,
            ...details
          },
          status: 'success',
          compliance_category: 'disclosure',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging data disclosure:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log data disclosure:', error);
      throw error;
    }
  }
}
