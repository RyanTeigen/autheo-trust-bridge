const express = require('express');
const router = express.Router();
const { supabaseSharingService } = require('../../services/SupabaseSharingService');

// GET /api/sharing-permissions - Get sharing permissions with pagination and filters
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/sharing-permissions - Request received with query:', req.query);
    const { limit, offset, granteeId, permissionType, status } = req.query;
    const options = { 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    };
    const filters = { granteeId, permissionType, status };
    
    const result = await supabaseSharingService.getSharingPermissions(options, filters);
    
    console.log('Sharing permissions result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching sharing permissions:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/sharing-permissions/:id - Get specific sharing permission by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/sharing-permissions/:id - Request received for ID:', req.params.id);
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid permission ID format' 
      });
    }
    
    const result = await supabaseSharingService.getSharingPermission(id);
    
    console.log('Sharing permission result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching sharing permission:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/sharing-permissions - Create new sharing permission
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/sharing-permissions - Request received with body:', req.body);
    const { medicalRecordId, granteeId, permissionType, expiresAt, patient_id } = req.body;
    
    // Validate required fields
    if (!medicalRecordId) {
      return res.status(400).json({
        success: false,
        error: 'Medical record ID is required'
      });
    }
    
    if (!granteeId) {
      return res.status(400).json({
        success: false,
        error: 'Grantee ID is required'
      });
    }
    
    if (!permissionType) {
      return res.status(400).json({
        success: false,
        error: 'Permission type is required'
      });
    }
    
    // Validate permission type
    if (!['read', 'write'].includes(permissionType)) {
      return res.status(400).json({
        success: false,
        error: 'Permission type must be either "read" or "write"'
      });
    }
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(medicalRecordId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid medical record ID format'
      });
    }
    
    if (!uuidRegex.test(granteeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid grantee ID format'
      });
    }
    
    const shareData = {
      medicalRecordId,
      granteeId,
      permissionType,
      expiresAt,
      patient_id
    };
    
    const result = await supabaseSharingService.shareRecordWithProvider(shareData);
    
    console.log('Create sharing permission result:', result);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error creating sharing permission:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/sharing-permissions/:id - Update sharing permission
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid permission ID format' 
      });
    }
    
    const { permissionType, expiresAt } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (permissionType !== undefined) {
      if (!['read', 'write'].includes(permissionType)) {
        return res.status(400).json({
          success: false,
          error: 'Permission type must be either "read" or "write"'
        });
      }
      updateData.permissionType = permissionType;
    }
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    const result = await supabaseSharingService.updateSharingPermission(id, updateData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error updating sharing permission:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/sharing-permissions/:id - Revoke sharing permission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid permission ID format' 
      });
    }
    
    const result = await supabaseSharingService.revokeSharingPermission(id);
    
    if (result.success) {
      res.status(204).send();
    } else {
      res.status(result.statusCode || 400).json(result);
    }
  } catch (error) {
    console.error('Error revoking sharing permission:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/sharing-permissions/record/:recordId - Get sharing permissions for a specific record
router.get('/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(recordId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid record ID format' 
      });
    }
    
    const { limit, offset } = req.query;
    const options = { 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    };
    const filters = { recordId };
    
    const result = await supabaseSharingService.getSharingPermissions(options, filters);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json(result);
    }
  } catch (error) {
    console.error('Error fetching record sharing permissions:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
