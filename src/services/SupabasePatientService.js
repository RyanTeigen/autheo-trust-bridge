
const { supabase } = require('../server/config/database');

class SupabasePatientService {
  async getPatients(options = {}) {
    try {
      console.log('Getting patients with options:', options);
      
      const { limit = 10, offset = 0 } = options;

      let query = supabase
        .from('patients')
        .select('*')
        .order('full_name');

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: patients, error, count } = await query;

      if (error) {
        console.error('Error fetching patients:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: {
          patients: patients || [],
          totalCount: count || 0,
          pagination: {
            limit,
            offset,
            hasMore: (patients?.length || 0) === limit
          }
        }
      };
    } catch (error) {
      console.error('Unexpected error in getPatients:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async getCurrentPatient() {
    // For testing, we'll create a mock current patient
    // In a real implementation, this would get the current user's patient record
    try {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching current patient:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: patients?.[0] || null
      };
    } catch (error) {
      console.error('Unexpected error in getCurrentPatient:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async getPatient(patientId) {
    try {
      console.log('Getting patient by ID:', patientId);

      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Patient not found',
            statusCode: 404
          };
        }
        console.error('Error fetching patient:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: patient
      };
    } catch (error) {
      console.error('Unexpected error in getPatient:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async createPatient(patientData) {
    try {
      console.log('Creating patient:', patientData);

      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          full_name: patientData.full_name,
          date_of_birth: patientData.date_of_birth,
          email: patientData.email,
          phone: patientData.phone,
          address: patientData.address,
          mrn: patientData.mrn,
          allergies: patientData.allergies,
          emergency_contact: patientData.emergency_contact,
          insurance_info: patientData.insurance_info,
          user_id: patientData.user_id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true,
        data: patient
      };
    } catch (error) {
      console.error('Unexpected error in createPatient:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      console.log('Updating patient:', patientId, patientData);

      const { data: patient, error } = await supabase
        .from('patients')
        .update({
          ...patientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Patient not found',
            statusCode: 404
          };
        }
        console.error('Error updating patient:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 400
        };
      }

      return {
        success: true,
        data: patient
      };
    } catch (error) {
      console.error('Unexpected error in updatePatient:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  async deletePatient(patientId) {
    try {
      console.log('Deleting patient:', patientId);

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        console.error('Error deleting patient:', error);
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
      console.error('Unexpected error in deletePatient:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }
}

module.exports = { supabasePatientService: new SupabasePatientService() };
