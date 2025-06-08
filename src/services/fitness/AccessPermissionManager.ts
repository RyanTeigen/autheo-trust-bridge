
import { supabase } from '@/integrations/supabase/client';
import { FitnessAccessPermission } from './types';

export class FitnessAccessPermissionManager {
  async grantAccessPermission(
    grantedTo: { userId?: string; organization?: string },
    permissionType: 'read' | 'write' | 'delete' | 'share' | 'research',
    dataCategories: string[],
    purpose: string,
    expiresAt?: string,
    conditions?: any
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_access_permissions')
        .insert({
          user_id: user.user.id,
          granted_to_user_id: grantedTo.userId,
          granted_to_organization: grantedTo.organization,
          permission_type: permissionType,
          data_categories: dataCategories,
          purpose,
          expires_at: expiresAt,
          conditions,
          granted_by: user.user.id
        });

      if (error) {
        console.error('Error granting access permission:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to grant access permission:', error);
      throw error;
    }
  }

  async getAccessPermissions(): Promise<FitnessAccessPermission[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from('fitness_access_permissions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access permissions:', error);
        throw error;
      }

      return (data || []) as FitnessAccessPermission[];
    } catch (error) {
      console.error('Failed to fetch access permissions:', error);
      return [];
    }
  }
}
