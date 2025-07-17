
const express = require('express');
const router = express.Router();
const { accessRequestService } = require('../../services/provider/AccessRequestService');
const { enhancedAccessRequestService } = require('../../services/provider/EnhancedAccessRequestService');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST /api/access/request - Request access to patient records
router.post('/request', async (req, res) => {
  try {
    console.log('POST /api/access/request - Request received with body:', req.body);
    const { patientEmail } = req.body;
    
    // Validate required fields
    if (!patientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Patient email is required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    const result = await accessRequestService.requestPatientAccess({ patientEmail });
    
    console.log('Access request result:', result);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      const statusCode = result.error?.includes('not found') ? 404 :
                        result.error?.includes('already exists') ? 409 :
                        result.error?.includes('permissions') ? 403 : 400;
      
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Error creating access request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/access/requests - Get provider's access requests
router.get('/requests', async (req, res) => {
  try {
    console.log('GET /api/access/requests - Request received');
    
    const result = await accessRequestService.getMyAccessRequests();
    
    console.log('Access requests result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      const statusCode = result.error?.includes('permissions') ? 403 : 500;
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/access/enhanced-request - Create enhanced access request
router.post('/enhanced-request', async (req, res) => {
  try {
    console.log('POST /api/access/enhanced-request - Request received with body:', req.body);
    const {
      patientEmail,
      requestType,
      urgencyLevel,
      hospitalId,
      department,
      clinicalJustification,
      permissionType,
      expiresAt
    } = req.body;
    
    // Validate required fields
    if (!patientEmail || !requestType || !urgencyLevel || !clinicalJustification || !permissionType) {
      return res.status(400).json({
        success: false,
        error: 'Patient email, request type, urgency level, clinical justification, and permission type are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    const result = await enhancedAccessRequestService.createEnhancedAccessRequest({
      patientEmail,
      requestType,
      urgencyLevel,
      hospitalId,
      department,
      clinicalJustification,
      permissionType,
      expiresAt
    });
    
    console.log('Enhanced access request result:', result);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      const statusCode = result.error?.includes('not found') ? 404 :
                        result.error?.includes('already') ? 409 :
                        result.error?.includes('permissions') ? 403 : 400;
      
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Error creating enhanced access request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/access/enhanced-requests - Get provider's enhanced access requests
router.get('/enhanced-requests', async (req, res) => {
  try {
    console.log('GET /api/access/enhanced-requests - Request received');
    
    const result = await enhancedAccessRequestService.getEnhancedAccessRequests();
    
    console.log('Enhanced access requests result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      const statusCode = result.error?.includes('permissions') ? 403 : 500;
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Error fetching enhanced access requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/access/enhanced-request/:id/reminder - Send reminder for access request
router.post('/enhanced-request/:id/reminder', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`POST /api/access/enhanced-request/${id}/reminder - Request received`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }
    
    const result = await enhancedAccessRequestService.sendReminder(id);
    
    console.log('Send reminder result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      const statusCode = result.error?.includes('not found') ? 404 :
                        result.error?.includes('wait') ? 429 : 400;
      
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
