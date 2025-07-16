-- Create quantum threat monitor table
CREATE TABLE public.quantum_threat_monitor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('low', 'moderate', 'high')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quantum_threat_monitor ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Compliance officers can view threat level" 
ON public.quantum_threat_monitor 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('compliance', 'admin')
));

CREATE POLICY "Compliance officers can update threat level" 
ON public.quantum_threat_monitor 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('compliance', 'admin')
));

-- Insert initial data
INSERT INTO public.quantum_threat_monitor (level) VALUES ('low');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_quantum_threat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quantum_threat_updated_at
BEFORE UPDATE ON public.quantum_threat_monitor
FOR EACH ROW
EXECUTE FUNCTION public.update_quantum_threat_updated_at();