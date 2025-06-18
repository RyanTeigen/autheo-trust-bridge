
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');

// Import routers
const patientsRouter = require('./routes/patients');
const medicalRecordsRouter = require('./routes/medical-records');
const sharingPermissionsRouter = require('./routes/sharing-permissions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected API routes
app.use('/api', authMiddleware);
app.use('/api/patients', patientsRouter);
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/sharing-permissions', sharingPermissionsRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
