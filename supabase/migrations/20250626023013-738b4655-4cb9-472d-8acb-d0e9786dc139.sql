
-- Create atomic_data_points table for storing encrypted atomic medical values
CREATE TABLE public.atomic_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
  data_type TEXT NOT NULL,
  enc_value TEXT NOT NULL,
  unit TEXT, -- Store measurement unit (e.g., 'mg/dL', 'bpm', 'mmHg')
  metadata JSONB DEFAULT '{}', -- Additional metadata for HE operations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_atomic_data_points_owner_id ON atomic_data_points(owner_id);
CREATE INDEX idx_atomic_data_points_record_id ON atomic_data_points(record_id);
CREATE INDEX idx_atomic_data_points_data_type ON atomic_data_points(data_type);
CREATE INDEX idx_atomic_data_points_created_at ON atomic_data_points(created_at DESC);

-- Enable RLS
ALTER TABLE public.atomic_data_points ENABLE ROW LEVEL SECURITY;

-- RLS policies for atomic_data_points
CREATE POLICY "Users can view their own atomic data points" 
ON public.atomic_data_points 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own atomic data points" 
ON public.atomic_data_points 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own atomic data points" 
ON public.atomic_data_points 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own atomic data points" 
ON public.atomic_data_points 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_atomic_data_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atomic_data_points_updated_at
    BEFORE UPDATE ON atomic_data_points
    FOR EACH ROW
    EXECUTE FUNCTION update_atomic_data_points_updated_at();
