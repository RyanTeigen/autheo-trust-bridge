import { beforeAll } from 'vitest';

beforeAll(() => {
  // Set up environment variables for testing
  if (!process.env.VITE_SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = 'https://ilhzzroafedbyttdfypf.supabase.co';
  }
  
  // Note: SUPABASE_SERVICE_ROLE_KEY should be set in your test environment
  // This is required for admin operations in tests
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Some tests may fail.');
  }
});