
const express = require('express');
const router = express.Router();
const { supabaseMedicalRecordsService } = require('../../services/SupabaseMedicalRecordsService');

// GET /api/medical-records - Get medical records with pagination and filters
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/medical-records - Request received with query:', req.query);
    const { limit, offset, recordType } = req.query;
    const options = { 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    };
    const filters = { recordType };
    
    const result = await supabaseMedicalRecordsService.getRecords(options, filters);
    
    console.log('Medical records result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/medical-records/:id - Get specific medical record by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/medical-records/:id - Request received for ID:', req.params.id);
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid record ID format' 
      });
    }
    
    const result = await supabaseMedicalRecordsService.getRecord(id);
    
    console.log('Medical record result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/medical-records - Create new medical record
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/medical-records - Request received with body:', req.body);
    const { recordType, title, description, diagnosis, treatment, notes, patient_id, user_id, ...data } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const recordData = {
      title,
      description,
      diagnosis,
      treatment,
      notes,
      patient_id,
      user_id,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    const result = await supabaseMedicalRecordsService.createRecord(recordData, recordType || 'general');
    
    console.log('Create medical record result:', result);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/medical-records/:id - Update medical record
router.put('/:id', async (req, res) => {
  try {
    console.log('PUT /api/medical-records/:id - Request received for ID:', req.params.id, 'Body:', req.body);
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid record ID format' 
      });
    }
    
    const { title, description, diagnosis, treatment, notes, ...updateData } = req.body;
    
    // Build update object with only provided fields
    const recordData = {};
    if (title !== undefined) recordData.title = title;
    if (description !== undefined) recordData.description = description;
    if (diagnosis !== undefined) recordData.diagnosis = diagnosis;
    if (treatment !== undefined) recordData.treatment = treatment;
    if (notes !== undefined) recordData.notes = notes;
    
    // Add any additional data fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        recordData[key] = updateData[key];
      }
    });
    
    if (Object.keys(recordData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    // Add last updated timestamp
    recordData.lastUpdated = new Date().toISOString();
    
    const result = await supabaseMedicalRecordsService.updateRecord(id, recordData);
    
    console.log('Update medical record result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/medical-records/:id - Delete medical record
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE /api/medical-records/:id - Request received for ID:', req.params.id);
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid record ID format' 
      });
    }
    
    const result = await supabaseMedicalRecordsService.deleteRecord(id);
    
    console.log('Delete medical record result:', result);
    
    if (result.success) {
      res.status(204).send();
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
