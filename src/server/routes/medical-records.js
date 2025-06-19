const express = require('express');
const { supabase, logAuditEvent } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

// Get all medical records for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { limit = 50, offset = 0, recordType } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (recordType && recordType !== 'all') {
      query = query.eq('record_type', recordType);
    }

    const { data, error } = await query;

    if (error) {
      await logAuditEvent(userId, 'GET_RECORDS_ERROR', 'medical_records', null, 'error', error.message, req.ip, req.get('User-Agent'));
      return res.status(400).json({ success: false, error: error.message });
    }

    // Log successful access
    await logAuditEvent(userId, 'GET_RECORDS', 'medical_records', null, 'success', `Retrieved ${data.length} records`, req.ip, req.get('User-Agent'));

    res.json({
      success: true,
      data: {
        records: data,
        total: data.length
      }
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    await logAuditEvent(req.user?.id, 'GET_RECORDS_ERROR', 'medical_records', null, 'error', error.message, req.ip, req.get('User-Agent'));
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get a specific medical record
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      await logAuditEvent(userId, 'GET_RECORD_ERROR', 'medical_record', id, 'error', error.message, req.ip, req.get('User-Agent'));
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    // Log successful access
    await logAuditEvent(userId, 'GET_RECORD', 'medical_record', id, 'success', `Accessed record`, req.ip, req.get('User-Agent'));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    await logAuditEvent(req.user?.id, 'GET_RECORD_ERROR', 'medical_record', req.params.id, 'error', error.message, req.ip, req.get('User-Agent'));
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create a new medical record
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const recordData = {
      ...req.body,
      user_id: userId,
      patient_id: userId,
      encrypted_data: JSON.stringify(req.body)
    };

    const { data, error } = await supabase
      .from('medical_records')
      .insert([recordData])
      .select()
      .single();

    if (error) {
      await logAuditEvent(userId, 'CREATE_RECORD_ERROR', 'medical_record', null, 'error', error.message, req.ip, req.get('User-Agent'));
      return res.status(400).json({ success: false, error: error.message });
    }

    // Log successful creation
    await logAuditEvent(userId, 'CREATE_RECORD', 'medical_record', data.id, 'success', `Created record: ${req.body.title || 'Untitled'}`, req.ip, req.get('User-Agent'));

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    await logAuditEvent(req.user?.id, 'CREATE_RECORD_ERROR', 'medical_record', null, 'error', error.message, req.ip, req.get('User-Agent'));
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update a medical record
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const updateData = {
      ...req.body,
      encrypted_data: JSON.stringify(req.body),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('medical_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      await logAuditEvent(userId, 'UPDATE_RECORD_ERROR', 'medical_record', id, 'error', error.message, req.ip, req.get('User-Agent'));
      return res.status(400).json({ success: false, error: error.message });
    }

    // Log successful update
    await logAuditEvent(userId, 'UPDATE_RECORD', 'medical_record', id, 'success', `Updated record: ${req.body.title || 'Untitled'}`, req.ip, req.get('User-Agent'));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    await logAuditEvent(req.user?.id, 'UPDATE_RECORD_ERROR', 'medical_record', req.params.id, 'error', error.message, req.ip, req.get('User-Agent'));
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete a medical record
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      await logAuditEvent(userId, 'DELETE_RECORD_ERROR', 'medical_record', id, 'error', error.message, req.ip, req.get('User-Agent'));
      return res.status(400).json({ success: false, error: error.message });
    }

    // Log successful deletion
    await logAuditEvent(userId, 'DELETE_RECORD', 'medical_record', id, 'success', 'Deleted medical record', req.ip, req.get('User-Agent'));

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    await logAuditEvent(req.user?.id, 'DELETE_RECORD_ERROR', 'medical_record', req.params.id, 'error', error.message, req.ip, req.get('User-Agent'));
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
