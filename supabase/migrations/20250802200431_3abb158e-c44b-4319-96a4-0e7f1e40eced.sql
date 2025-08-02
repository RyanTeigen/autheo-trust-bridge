-- Ensure policy_acknowledgments table exists with proper structure and RLS
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own policy acknowledgments" ON public.policy_acknowledgments;
DROP POLICY IF EXISTS "Users can insert their own policy acknowledgments" ON public.policy_acknowledgments;
DROP POLICY IF EXISTS "Admins and compliance can view all acknowledgments" ON public.policy_acknowledgments;
DROP POLICY IF EXISTS "compliance_view_all_acknowledgments" ON public.policy_acknowledgments;

-- Create RLS policies
CREATE POLICY "Users can view their own policy acknowledgments"
ON public.policy_acknowledgments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy acknowledgments"
ON public.policy_acknowledgments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and compliance can view all acknowledgments"
ON public.policy_acknowledgments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'compliance')
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_user_version 
ON public.policy_acknowledgments(user_id, policy_version);

-- Add constraint to prevent duplicate acknowledgments
ALTER TABLE public.policy_acknowledgments 
DROP CONSTRAINT IF EXISTS unique_user_policy_version;

ALTER TABLE public.policy_acknowledgments 
ADD CONSTRAINT unique_user_policy_version 
UNIQUE (user_id, policy_version);