
const express = require('express');
const { supabase } = require('../../integrations/supabase/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: Verify if user is authorized to export patient's records
async function isAuthorized(userId, patientId) {
  if (userId === patientId) return true; // patient exporting own data

  // Check if user is a provider authorized for this patient
  const { data, error } = await supabase
    .from('sharing_permissions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('grantee_id', userId)
    .eq('status', 'approved')
    .limit(1)
    .single();

  return !!data && !error;
}

// Helper: Convert records to CSV format
function convertToCSV(records) {
  if (!records || records.length === 0) return '';
  
  const headers = ['id', 'patient_id', 'record_type', 'created_at', 'updated_at'];
  const csvRows = [headers.join(',')];
  
  records.forEach(record => {
    const row = [
      record.id || '',
      record.patient_id || '',
      record.record_type || '',
      record.created_at || '',
      record.updated_at || ''
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// GET /api/records/export - Export patient medical records
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { patientId, startDate, endDate, format = 'csv' } = req.query;
    const userId = req.user.id;

    // Validate required parameters
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'patientId is required' 
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid patientId format' 
      });
    }

    // Check authorization
    const authorized = await isAuthorized(userId, patientId);
    if (!authorized) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to access this patient\'s records' 
      });
    }

    // Build query with filters
    let query = supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: records, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch records' 
      });
    }

    // Log the export for audit trail
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'EXPORT_MEDICAL_RECORDS',
      resource: 'medical_records',
      resource_id: patientId,
      status: 'success',
      details: `Exported ${records?.length || 0} medical records`,
      timestamp: new Date().toISOString()
    });

    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename=medical-records-${patientId.slice(0, 8)}.json`);
      res.setHeader('Content-Type', 'application/json');
      
      res.json({
        success: true,
        data: {
          patientId,
          exportedAt: new Date().toISOString(),
          recordCount: records?.length || 0,
          records: records || []
        }
      });
    } else {
      // Default to CSV
      const csv = convertToCSV(records);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=medical-records-${patientId.slice(0, 8)}.csv`);
      
      res.send(csv);
    }

  } catch (error) {
    console.error('Export error:', error);
    
    // Log the error for audit trail
    await supabase.from('audit_logs').insert({
      user_id: req.user?.id,
      action: 'EXPORT_MEDICAL_RECORDS',
      resource: 'medical_records',
      status: 'error',
      details: `Export failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during export' 
    });
  }
});

module.exports = router;
