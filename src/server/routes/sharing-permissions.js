
const express = require('express');
const router = express.Router();
const { recordSharingService } = require('../../services/patient/RecordSharingService');

// GET /api/sharing-permissions - Get sharing permissions with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { limit, offset, granteeId, permissionType, status } = req.query;
    const options = { 
      limit: limit ? parseInt(limit) : undefined, 
      offset: offset ? parseInt(offset) : undefined 
    };
    const filters = { granteeId, permissionType, status };
    
    const result = await recordSharingService.getSharingPermissions(options, filters);
    
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
    const { id } = req.params;
    const result = await recordSharingService.getSharingPermission(id);
    
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
    const result = await recordSharingService.shareRecordWithProvider(req.body);
    
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
    const result = await recordSharingService.updateSharingPermission(id, req.body);
    
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
    const result = await recordSharingService.revokeSharingPermission(id);
    
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

module.exports = router;
