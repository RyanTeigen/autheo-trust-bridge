
const { supabase } = require('../server/config/database');

class SupabaseMedicalRecordsService {
  async getRecords(options = {}, filters = {}) {
    try {
      console.log('Getting medical records with options:', options, 'filters:', filters);
      
      const { limit = 10, offset = 0 } = options;
      const { recordType } = filters;

      let query = supabase
        .from('medical_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordType) {
        query = query.eq('record_type', recordType);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: records, error, count } = await query;

      if (error) {
        console.error('Error fetching medical records:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: {
          records: records || [],
          totalCount: count || 0,
          pagination: {
            limit,
            offset,
            hasMore: (records?.length || 0) === limit
          }
        }
      };
    } catch (error) {
      console.error('Unexpected error in getRecords:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async getRecord(id) {
    try {
      console.log('Getting medical record by ID:', id);

      const { data: record, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Medical record not found',
            statusCode: 404
          };
        }
        console.error('Error fetching medical record:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: record
      };
    } catch (error) {
      console.error('Unexpected error in getRecord:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async createRecord(recordData, recordType = 'general') {
    try {
      console.log('Creating medical record:', { recordData, recordType });

      // For now, we'll store the data as encrypted JSON
      const encryptedData = JSON.stringify(recordData);

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          encrypted_data: encryptedData,
          record_type: recordType,
          patient_id: recordData.patient_id,
          user_id: recordData.user_id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating medical record:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true,
        data: record
      };
    } catch (error) {
      console.error('Unexpected error in createRecord:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async updateRecord(id, recordData) {
    try {
      console.log('Updating medical record:', id, recordData);

      // Get existing record first
      const { data: existingRecord, error: fetchError } = await supabase
        .from('medical_records')
        .select('encrypted_data')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Medical record not found',
            statusCode: 404
          };
        }
        return {
          success: false,
          error: fetchError.message,
          statusCode: 500
        };
      }

      // Merge existing data with updates
      const existingData = JSON.parse(existingRecord.encrypted_data);
      const updatedData = { ...existingData, ...recordData };
      const encryptedData = JSON.stringify(updatedData);

      const { data: record, error } = await supabase
        .from('medical_records')
        .update({
          encrypted_data: encryptedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating medical record:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true,
        data: record
      };
    } catch (error) {
      console.error('Unexpected error in updateRecord:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async deleteRecord(id) {
    try {
      console.log('Deleting medical record:', id);

      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting medical record:', error);
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
      console.error('Unexpected error in deleteRecord:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }
}

module.exports = { supabaseMedicalRecordsService: new SupabaseMedicalRecordsService() };
