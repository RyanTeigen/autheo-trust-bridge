
// This file serves as a type definition for the patients table structure
// The actual table creation is handled in the database migrations

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

// Export for use in other components
export type { Patient };
