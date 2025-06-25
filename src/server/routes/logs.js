
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { supabase } = require('../../integrations/supabase/client');

const router = express.Router();

// GET /api/logs - Get audit logs (compliance officers only)
router.get('/', authMiddleware, async (req, res) => {
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

    // Check if user has compliance role
    if (profile.role !== 'compliance' && profile.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Compliance role required.' 
      });
    }

    // Fetch audit logs
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error('Failed to fetch audit logs: ' + error.message);
    }

    res.json({
      success: true,
      data: auditLogs || []
    });

  } catch (error) {
    console.error('Error in audit logs endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

module.exports = router;
