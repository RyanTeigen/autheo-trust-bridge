
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Use production-safe logging - import dynamically to avoid issues
  import('../services/security/ProductionLogger.js').then(({ productionLogger }) => {
    productionLogger.info(`${req.method} ${req.path}`, {
      timestamp,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
    
    if (req.body && Object.keys(req.body).length > 0) {
      // Sanitize sensitive data before logging
      const sanitizedBody = { ...req.body };
      const sensitiveKeys = ['password', 'token', 'key', 'secret', 'privateKey'];
      sensitiveKeys.forEach(key => {
        if (sanitizedBody[key]) sanitizedBody[key] = '[REDACTED]';
      });
      
      productionLogger.info('Request body received', { body: sanitizedBody });
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
      productionLogger.info('Query parameters received', { params: req.query });
    }
  }).catch(error => {
    // Fallback for development - minimal logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] ${req.method} ${req.path}`);
    }
  });
  
  next();
};

module.exports = loggingMiddleware;
