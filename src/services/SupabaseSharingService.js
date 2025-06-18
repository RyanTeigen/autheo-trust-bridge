
const { supabase } = require('../server/config/database');

class SupabaseSharingService {
  async getSharingPermissions(options = {}, filters = {}) {
    try {
      console.log('Getting sharing permissions with options:', options, 'filters:', filters);
      
      const { limit = 10, offset = 0 } = options;
      const { granteeId, permissionType, status } = filters;

      let query = supabase
        .from('sharing_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (granteeId) {
        query = query.eq('grantee_id', granteeId);
      }

      if (permissionType) {
        query = query.eq('permission_type', permissionType);
      }

      if (status === 'active') {
        query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
      } else if (status === 'expired') {
        query = query.lt('expires_at', new Date().toISOString());
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: permissions, error, count } = await query;

      if (error) {
        console.error('Error fetching sharing permissions:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: {
          permissions: permissions || [],
          totalCount: count || 0,
          pagination: {
            limit,
            offset,
            hasMore: (permissions?.length || 0) === limit
          }
        }
      };
    } catch (error) {
      console.error('Unexpected error in getSharingPermissions:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async getSharingPermission(permissionId) {
    try {
      console.log('Getting sharing permission by ID:', permissionId);

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('id', permissionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Sharing permission not found',
            statusCode: 404
          };
        }
        console.error('Error fetching sharing permission:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: permission
      };
    } catch (error) {
      console.error('Unexpected error in getSharingPermission:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async shareRecordWithProvider(shareData) {
    try {
      console.log('Creating sharing permission:', shareData);

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .insert({
          medical_record_id: shareData.medicalRecordId,
          grantee_id: shareData.granteeId,
          permission_type: shareData.permissionType,
          expires_at: shareData.expiresAt,
          patient_id: shareData.patient_id // This should be provided
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sharing permission:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true,
        data: permission
      };
    } catch (error) {
      console.error('Unexpected error in shareRecordWithProvider:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async updateSharingPermission(permissionId, updateData) {
    try {
      console.log('Updating sharing permission:', permissionId, updateData);

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .update(updateData)
        .eq('id', permissionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Sharing permission not found',
            statusCode: 404
          };
        }
        console.error('Error updating sharing permission:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true,
        data: permission
      };
    } catch (error) {
      console.error('Unexpected error in updateSharingPermission:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async revokeSharingPermission(permissionId) {
    try {
      console.log('Revoking sharing permission:', permissionId);

      const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('Error revoking sharing permission:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in revokeSharingPermission:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }
}

module.exports = { supabaseSharingService: new SupabaseSharingService() };
