
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { supabase } = require('../../integrations/supabase/client');
const crypto = require('crypto');

const router = express.Router();

// Helper function to convert audit logs to CSV format
function convertToCSV(logs) {
  if (!logs || logs.length === 0) {
    return 'timestamp,action,resource,resource_id,status,details,user_id,ip_address,user_agent\n';
  }

  const headers = ['timestamp', 'action', 'resource', 'resource_id', 'status', 'details', 'user_id', 'ip_address', 'user_agent'];
  const csvRows = [headers.join(',')];

  logs.forEach(log => {
    const row = headers.map(header => {
      const value = log[header] || '';
      // Escape commas and quotes in CSV values
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// GET /api/audit/export - Export audit logs as CSV with integrity hash
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve user profile' 
      });
    }

    // Check if user has compliance or admin role
    if (profile.role !== 'compliance' && profile.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Compliance or admin role required for audit log export.' 
      });
    }

    // Fetch all audit logs ordered by timestamp
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch audit logs: ' + error.message);
    }

    // Convert to CSV format
    const csvData = convertToCSV(auditLogs || []);
    
    // Generate SHA-256 hash for integrity verification
    const hash = crypto.createHash('sha256').update(csvData).digest('hex');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit_logs_${timestamp}.csv`;

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Audit-Hash', hash);
    res.setHeader('X-Export-Timestamp', new Date().toISOString());
    res.setHeader('X-Total-Records', (auditLogs || []).length);

    // Log the export action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'export_audit_logs',
        resource: 'audit_logs',
        status: 'success',
        details: `Exported ${(auditLogs || []).length} audit log records with hash: ${hash.substring(0, 16)}...`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    res.send(csvData);

  } catch (error) {
    console.error('Error in audit export endpoint:', error);
    
    // Log the failed export attempt
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: req.user?.id,
          action: 'export_audit_logs',
          resource: 'audit_logs',
          status: 'error',
          details: `Export failed: ${error.message}`,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
    } catch (logError) {
      console.error('Failed to log export error:', logError);
    }

    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error during audit log export' 
    });
  }
});

module.exports = router;
