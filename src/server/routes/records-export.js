
const express = require('express');
const { supabase } = require('../../integrations/supabase/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/records/export - Export encrypted medical record
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { recordId, userKey } = req.query;
    const userId = req.user.id;

    if (!recordId || !userKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing recordId or userKey parameter' 
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(recordId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid record ID format' 
      });
    }

    // Fetch the medical record - ensure user owns it
    const { data: record, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch record' 
      });
    }

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        error: 'Record not found or access denied' 
      });
    }

    // Simple encryption for demo - in production use proper AES-GCM
    const crypto = require('crypto');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher('aes-256-gcm', userKey);
    
    let encrypted = cipher.update(JSON.stringify(record), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const exportData = {
      iv: iv.toString('hex'),
      encrypted: encrypted,
      recordId: recordId,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Log the export for audit trail
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'EXPORT_MEDICAL_RECORD',
      resource: 'medical_record',
      resource_id: recordId,
      status: 'success',
      details: 'Medical record exported by patient'
    });

    res.setHeader('Content-Disposition', `attachment; filename=medical-record-${recordId.slice(0, 8)}.enc.json`);
    res.setHeader('Content-Type', 'application/json');
    
    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during export' 
    });
  }
});

module.exports = router;
