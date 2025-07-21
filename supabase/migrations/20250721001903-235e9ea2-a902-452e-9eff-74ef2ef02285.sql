
-- Add provider selection and notification fields to atomic_data_points
ALTER TABLE atomic_data_points 
ADD COLUMN IF NOT EXISTS notify_provider boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS provider_id uuid,
ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_sent_at timestamp with time zone;

-- Create index for provider notifications
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_provider_notifications 
ON atomic_data_points(provider_id, notification_sent) 
WHERE notify_provider = true;

-- Create index for data type and owner for better performance
CREATE INDEX IF NOT EXISTS idx_atomic_data_points_data_type_owner 
ON atomic_data_points(data_type, owner_id, created_at DESC);

-- Add sample appointment data type mappings for health tracker
INSERT INTO appointment_data_type_mappings (appointment_type, required_data_types, access_justification, priority_level)
VALUES 
  ('cardiology', ARRAY['blood_pressure', 'heart_rate'], 'Cardiovascular assessment requires vital signs monitoring', 'high'),
  ('general_checkup', ARRAY['weight', 'blood_pressure', 'heart_rate', 'temperature'], 'Comprehensive health assessment', 'normal'),
  ('endocrinology', ARRAY['weight', 'blood_pressure'], 'Metabolic health monitoring', 'normal'),
  ('primary_care', ARRAY['weight', 'blood_pressure', 'heart_rate', 'temperature'], 'General health monitoring', 'normal')
ON CONFLICT (appointment_type) DO UPDATE SET
  required_data_types = EXCLUDED.required_data_types,
  access_justification = EXCLUDED.access_justification,
  priority_level = EXCLUDED.priority_level;
