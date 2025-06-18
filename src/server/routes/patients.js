
const express = require('express');
const router = express.Router();
const { supabasePatientService } = require('../../services/SupabasePatientService');

// GET /api/patients - Get all patients for the authenticated user
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/patients - Request received');
    const { limit, offset } = req.query;
    const result = await supabasePatientService.getPatients({ 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    });
    
    console.log('Patients result:', result);
    
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
    console.log('GET /api/patients/current - Request received');
    const result = await supabasePatientService.getCurrentPatient();
    
    console.log('Current patient result:', result);
    
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
    console.log('GET /api/patients/:id - Request received for ID:', req.params.id);
    const { id } = req.params;
    const result = await supabasePatientService.getPatient(id);
    
    console.log('Patient result:', result);
    
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
    console.log('POST /api/patients - Request received with body:', req.body);
    const result = await supabasePatientService.createPatient(req.body);
    
    console.log('Create patient result:', result);
    
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
    console.log('PUT /api/patients/:id - Request received for ID:', req.params.id, 'Body:', req.body);
    const { id } = req.params;
    const result = await supabasePatientService.updatePatient(id, req.body);
    
    console.log('Update patient result:', result);
    
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
    console.log('DELETE /api/patients/:id - Request received for ID:', req.params.id);
    const { id } = req.params;
    const result = await supabasePatientService.deletePatient(id);
    
    console.log('Delete patient result:', result);
    
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
