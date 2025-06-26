
const express = require('express');
const cors = require('cors');
const sharingPermissionsRoutes = require('./routes/sharing-permissions');
const accessRequestRoutes = require('./routes/access-requests');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sharing-permissions', sharingPermissionsRoutes);
app.use('/api/access', accessRequestRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
