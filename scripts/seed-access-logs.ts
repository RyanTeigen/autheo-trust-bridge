import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ilhzzroafedbyttdfypf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAccessLogs() {
  console.log('🌱 Starting access logs seeding...');
  
  try {
    // First, get some existing data to create realistic relationships
    const { data: patients } = await supabase
      .from('patients')
      .select('id, user_id')
      .limit(3);
    
    const { data: providers } = await supabase
      .from('providers')
      .select('id')
      .limit(2);
    
    const { data: records } = await supabase
      .from('medical_records')
      .select('id, patient_id, provider_id')
      .limit(5);

    if (!patients?.length || !providers?.length || !records?.length) {
      console.log('⚠️  No patients, providers, or records found. Please seed those tables first.');
      return;
    }

    // Generate realistic access logs
    const accessLogs = [];
    const actions = ['viewed', 'updated', 'downloaded', 'shared', 'created'];
    
    for (let i = 0; i < 20; i++) {
      const record = records[Math.floor(Math.random() * records.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      // Create timestamp within last 30 days
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
      
      accessLogs.push({
        patient_id: record.patient_id,
        provider_id: provider.id,
        record_id: record.id,
        action: action,
        log_timestamp: timestamp.toISOString(),
      });
    }

    const { data, error } = await supabase
      .from('access_logs')
      .insert(accessLogs);

    if (error) {
      console.error('❌ Seeding failed:', error);
      return;
    }

    console.log('✅ Successfully seeded', accessLogs.length, 'access logs');
    console.log('📊 Sample log:', accessLogs[0]);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Run the seeder
if (require.main === module) {
  seedAccessLogs().then(() => {
    console.log('🏁 Seeding completed');
    process.exit(0);
  });
}

export { seedAccessLogs };