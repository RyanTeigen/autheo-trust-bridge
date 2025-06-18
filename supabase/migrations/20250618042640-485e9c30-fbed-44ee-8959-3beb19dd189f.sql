
-- First, let's examine the current structure and fix the missing relationships

-- Add patient_id column to medical_records if it doesn't exist
DO $$ 
BEGIN
    -- Add patient_id to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medical_records' AND column_name = 'patient_id') THEN
        ALTER TABLE medical_records ADD COLUMN patient_id UUID;
    END IF;
    
    -- Add full_name to patients table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'full_name') THEN
        ALTER TABLE patients ADD COLUMN full_name TEXT;
    END IF;
    
    -- Add user_id to patients table if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'user_id') THEN
        ALTER TABLE patients ADD COLUMN user_id UUID;
    END IF;
    
    -- Add email to patients table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'email') THEN
        ALTER TABLE patients ADD COLUMN email TEXT;
    END IF;
END $$;

-- Create sharing_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS sharing_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  grantee_id UUID NOT NULL, -- who is given access (provider, compliance, etc)
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- e.g., "read", "write"
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint for medical_records.patient_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'medical_records_patient_id_fkey'
    ) THEN
        ALTER TABLE medical_records 
        ADD CONSTRAINT medical_records_patient_id_fkey 
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create RLS policies only if they don't exist
DO $$ 
BEGIN
    -- RLS Policies for patients table
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Users can view their own patient record') THEN
        CREATE POLICY "Users can view their own patient record" ON patients
          FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Users can insert their own patient record') THEN
        CREATE POLICY "Users can insert their own patient record" ON patients
          FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Users can update their own patient record') THEN
        CREATE POLICY "Users can update their own patient record" ON patients
          FOR UPDATE USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Providers can view patients with sharing permissions') THEN
        CREATE POLICY "Providers can view patients with sharing permissions" ON patients
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM sharing_permissions sp
              WHERE sp.patient_id = patients.id
              AND sp.grantee_id = auth.uid()
              AND (sp.expires_at IS NULL OR sp.expires_at > now())
            )
          );
    END IF;

    -- RLS Policies for medical_records table (only after patient_id column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'medical_records' AND column_name = 'patient_id') THEN
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Patients can view their own medical records') THEN
            CREATE POLICY "Patients can view their own medical records" ON medical_records
              FOR SELECT USING (
                EXISTS (
                  SELECT 1 FROM patients p
                  WHERE p.id = medical_records.patient_id
                  AND p.user_id = auth.uid()
                )
              );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Patients can insert their own medical records') THEN
            CREATE POLICY "Patients can insert their own medical records" ON medical_records
              FOR INSERT WITH CHECK (
                EXISTS (
                  SELECT 1 FROM patients p
                  WHERE p.id = medical_records.patient_id
                  AND p.user_id = auth.uid()
                )
              );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Patients can update their own medical records') THEN
            CREATE POLICY "Patients can update their own medical records" ON medical_records
              FOR UPDATE USING (
                EXISTS (
                  SELECT 1 FROM patients p
                  WHERE p.id = medical_records.patient_id
                  AND p.user_id = auth.uid()
                )
              );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Grantees can view shared medical records') THEN
            CREATE POLICY "Grantees can view shared medical records" ON medical_records
              FOR SELECT USING (
                EXISTS (
                  SELECT 1 FROM sharing_permissions sp
                  WHERE sp.medical_record_id = medical_records.id
                  AND sp.grantee_id = auth.uid()
                  AND sp.permission_type IN ('read', 'write')
                  AND (sp.expires_at IS NULL OR sp.expires_at > now())
                )
              );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Grantees can update shared medical records with write permission') THEN
            CREATE POLICY "Grantees can update shared medical records with write permission" ON medical_records
              FOR UPDATE USING (
                EXISTS (
                  SELECT 1 FROM sharing_permissions sp
                  WHERE sp.medical_record_id = medical_records.id
                  AND sp.grantee_id = auth.uid()
                  AND sp.permission_type = 'write'
                  AND (sp.expires_at IS NULL OR sp.expires_at > now())
                )
              );
        END IF;
    END IF;

    -- RLS Policies for sharing_permissions table
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sharing_permissions' AND policyname = 'Patients can manage their own sharing permissions') THEN
        CREATE POLICY "Patients can manage their own sharing permissions" ON sharing_permissions
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM patients p
              WHERE p.id = sharing_permissions.patient_id
              AND p.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sharing_permissions' AND policyname = 'Grantees can view permissions granted to them') THEN
        CREATE POLICY "Grantees can view permissions granted to them" ON sharing_permissions
          FOR SELECT USING (grantee_id = auth.uid());
    END IF;
END $$;
