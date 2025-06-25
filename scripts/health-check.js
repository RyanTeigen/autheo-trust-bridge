
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function healthCheck() {
  console.log('🏥 Starting health check...');

  try {
    // Check database connectivity
    const { data: auditLogsCount, error: auditError } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true });

    if (auditError) {
      throw new Error(`Audit logs table check failed: ${auditError.message}`);
    }

    console.log(`✅ Audit logs table accessible (${auditLogsCount || 0} records)`);

    // Check audit anchors table
    const { data: anchorsCount, error: anchorsError } = await supabase
      .from('audit_anchors')
      .select('id', { count: 'exact', head: true });

    if (anchorsError) {
      throw new Error(`Audit anchors table check failed: ${anchorsError.message}`);
    }

    console.log(`✅ Audit anchors table accessible (${anchorsCount || 0} records)`);

    // Check recent anchoring activity
    const { data: recentAnchors, error: recentError } = await supabase
      .from('audit_anchors')
      .select('anchored_at')
      .order('anchored_at', { ascending: false })
      .limit(1);

    if (recentError) {
      throw new Error(`Recent anchors check failed: ${recentError.message}`);
    }

    if (recentAnchors && recentAnchors.length > 0) {
      const lastAnchor = new Date(recentAnchors[0].anchored_at);
      const hoursSinceLastAnchor = (Date.now() - lastAnchor.getTime()) / (1000 * 60 * 60);
      console.log(`✅ Last anchor: ${lastAnchor.toISOString()} (${hoursSinceLastAnchor.toFixed(1)}h ago)`);

      if (hoursSinceLastAnchor > 12) {
        console.warn(`⚠️ Warning: Last anchor was more than 12 hours ago`);
      }
    } else {
      console.log('ℹ️ No anchors found in database');
    }

    console.log('🎉 Health check completed successfully!');

  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

// Run the health check
healthCheck().catch(console.error);
