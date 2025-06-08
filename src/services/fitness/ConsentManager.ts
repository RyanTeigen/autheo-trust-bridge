
import { supabase } from '@/integrations/supabase/client';
import { FitnessConsentRecord } from './types';

export class FitnessConsentManager {
  private getClientIP(): string {
    return '127.0.0.1';
  }

  async recordConsent(
    consentType: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access',
    consentStatus: boolean,
    consentText: string,
    consentVersion: string = '1.0'
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_consent_records')
        .insert({
          user_id: user.user.id,
          consent_type: consentType,
          consent_status: consentStatus,
          consent_text: consentText,
          consent_version: consentVersion,
          ip_address: this.getClientIP()
        });

      if (error) {
        console.error('Error recording consent:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw error;
    }
  }

  async getConsentRecords(): Promise<FitnessConsentRecord[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from('fitness_consent_records')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consent records:', error);
        throw error;
      }

      return (data || []) as FitnessConsentRecord[];
    } catch (error) {
      console.error('Failed to fetch consent records:', error);
      return [];
    }
  }
}
