-- Fix patients table to have proper UUID default and constraints
ALTER TABLE patients ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE patients ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key relationship between enhanced_appointments and profiles
ALTER TABLE enhanced_appointments 
ADD CONSTRAINT enhanced_appointments_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES profiles(id);