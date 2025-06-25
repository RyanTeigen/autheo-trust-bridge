
const express = require('express');
const authMiddleware = require('../middleware/auth');
const SharedRecordsController = require('../controllers/SharedRecordsController');

const router = express.Router();

// GET /api/shared-records - Get records shared with the current user
router.get('/', authMiddleware, SharedRecordsController.getSharedRecords);

// GET /api/shared-records/decrypted - Get all shared records with decryption
router.get('/decrypted', authMiddleware, SharedRecordsController.getDecryptedSharedRecords);

// GET /api/shared-records/:shareId/decrypt - Decrypt a specific shared record
router.get('/:shareId/decrypt', authMiddleware, SharedRecordsController.decryptSpecificRecord);

module.exports = router;
