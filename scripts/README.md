# Database Seeding Scripts

This directory contains scripts to seed your Supabase database with test data.

## Access Logs Seeder

The `seed-access-logs.ts` script creates realistic access log entries for testing the patient access log viewer.

### Prerequisites

Before running the seeder, make sure you have:
1. Valid data in your `patients`, `providers`, and `medical_records` tables
2. The `SUPABASE_SERVICE_ROLE_KEY` environment variable set

### Running the Seeder

#### Option 1: Using Node.js directly
```bash
# Set your service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the seeder
npx tsx scripts/seed-access-logs.ts
```

#### Option 2: Using SQL directly in Supabase SQL Editor
```sql
-- Replace with actual UUIDs from your database
INSERT INTO access_logs (patient_id, provider_id, record_id, action)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'viewed'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'updated'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'downloaded');
```

### What the Seeder Does

1. Fetches existing patients, providers, and medical records
2. Creates 20 realistic access log entries with:
   - Random combinations of patients, providers, and records
   - Various actions (viewed, updated, downloaded, shared, created)
   - Timestamps within the last 30 days
3. Inserts the data into the `access_logs` table

### Output

The seeder will output:
- How many access logs were created
- Sample data for verification
- Any errors that occurred

## Environment Variables

Make sure to set these environment variables:

```bash
# Required for seeding
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# The script uses hardcoded project URL for now, but you can modify it
# SUPABASE_URL=https://your-project.supabase.co
```

## Troubleshooting

### "No patients, providers, or records found"
- Make sure you have data in your `patients`, `providers`, and `medical_records` tables first
- Check that your service role key has the correct permissions

### Permission Errors
- Verify your service role key is correct
- Check that RLS policies allow the service role to insert into `access_logs`

### Type Errors
- Make sure you're using the correct TypeScript version
- Run `npm install` to ensure all dependencies are installed