
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const loggingMiddleware = require('./middleware/logging');

// Import routers
const patientsRouter = require('./routes/patients');
const medicalRecordsRouter = require('./routes/medical-records');
const sharingPermissionsRouter = require('./routes/sharing-permissions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware); // Add logging middleware

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint without auth for debugging
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Protected API routes (comment out auth middleware for testing)
// app.use('/api', authMiddleware);
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
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log('🔧 Available API endpoints:');
  console.log('  - GET  /api/patients');
  console.log('  - POST /api/patients');
  console.log('  - GET  /api/medical-records');
  console.log('  - POST /api/medical-records');
  console.log('  - GET  /api/sharing-permissions');
  console.log('  - POST /api/sharing-permissions');
});

module.exports = app;
