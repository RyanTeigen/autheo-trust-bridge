-- Clean up duplicate medical records and add constraints to prevent future duplicates

-- First, let's keep only the first medical record for each user
DELETE FROM medical_records 
WHERE id = '63fda21b-8e89-4e9a-a84b-5c5c5f30500d';

-- Add a unique constraint to prevent duplicate medical records per user
ALTER TABLE medical_records 
ADD CONSTRAINT unique_medical_record_per_user 
UNIQUE (user_id, record_type);

-- Also add a unique constraint for patient_id and record_type to prevent duplicates at patient level
ALTER TABLE medical_records 
ADD CONSTRAINT unique_medical_record_per_patient 
UNIQUE (patient_id, record_type);