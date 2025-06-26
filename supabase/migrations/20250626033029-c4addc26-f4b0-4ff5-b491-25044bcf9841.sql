
-- Check if RLS is enabled and add policies if missing
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'atomic_data_points' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE atomic_data_points ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'atomic_data_points' 
        AND policyname = 'Users can access their own atomic data'
    ) THEN
        CREATE POLICY "Users can access their own atomic data" 
          ON atomic_data_points 
          FOR ALL 
          USING (owner_id = auth.uid());
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_owner_id ON atomic_data_points(owner_id);
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_data_type ON atomic_data_points(data_type);
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_created_at ON atomic_data_points(created_at);
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_record_id ON atomic_data_points(record_id);
