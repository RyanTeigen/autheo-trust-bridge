
const express = require('express');
const router = express.Router();
const { enhancedMedicalRecordsService } = require('../../services/EnhancedMedicalRecordsService');

// GET /api/medical-records - Get medical records with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { limit, offset, recordType } = req.query;
    const options = { 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    };
    const filters = { recordType };
    
    const result = await enhancedMedicalRecordsService.getRecords(options, filters);
    
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
    const { id } = req.params;
    const result = await enhancedMedicalRecordsService.getRecord(id);
    
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
    const { recordType, ...data } = req.body;
    const result = await enhancedMedicalRecordsService.createRecord(data, recordType);
    
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
    const { id } = req.params;
    const result = await enhancedMedicalRecordsService.updateRecord(id, req.body);
    
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
    const { id } = req.params;
    const result = await enhancedMedicalRecordsService.deleteRecord(id);
    
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
