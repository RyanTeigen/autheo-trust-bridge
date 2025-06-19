
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ilhzzroafedbyttdfypf.supabase.co";

// Use environment variable first, fallback to placeholder 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Audit logging may not work properly.');
}

// Create Supabase client for server operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to log audit events from server-side operations
const logAuditEvent = async (userId, action, resource, resourceId = null, status = 'success', details = null, ipAddress = null, userAgent = null) => {
  try {
    const auditEntry = {
      user_id: userId,
      action: action,
      resource: resource,
      resource_id: resourceId,
      status: status,
      details: details,
      ip_address: ipAddress || '127.0.0.1',
      user_agent: userAgent || 'Server',
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry);

    if (error) {
      console.error('Failed to log audit event:', error);
    } else {
      console.log('Audit event logged:', action, resource);
    }
  } catch (error) {
    console.error('Error in server-side audit logging:', error);
  }
};

module.exports = { supabase, logAuditEvent };
