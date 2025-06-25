
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { supabase } = require('../../integrations/supabase/client');

const router = express.Router();

// GET /api/audit/anchors - Get all blockchain anchors
router.get('/anchors', authMiddleware, async (req, res) => {
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
        error: 'Access denied. Compliance or admin role required for anchor access.' 
      });
    }

    // Fetch all audit anchors
    const { data: anchors, error } = await supabase
      .from('audit_anchors')
      .select('*')
      .order('anchored_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch audit anchors: ' + error.message);
    }

    res.json({
      success: true,
      data: anchors || []
    });

  } catch (error) {
    console.error('Error in audit anchors endpoint:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error while fetching audit anchors' 
    });
  }
});

module.exports = router;
