
const express = require('express');
const router = express.Router();
const { patientProfileService } = require('../../services/patient/PatientProfileService');

// GET /api/patients - Get all patients for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await patientProfileService.getPatients({ 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/patients/current - Get current patient profile
router.get('/current', async (req, res) => {
  try {
    const result = await patientProfileService.getCurrentPatient();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching current patient:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/patients/:id - Get specific patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await patientProfileService.getPatient(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/patients - Create new patient
router.post('/', async (req, res) => {
  try {
    const result = await patientProfileService.createPatient(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await patientProfileService.updatePatient(id, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await patientProfileService.deletePatient(id);
    
    if (result.success) {
      res.status(204).send();
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
