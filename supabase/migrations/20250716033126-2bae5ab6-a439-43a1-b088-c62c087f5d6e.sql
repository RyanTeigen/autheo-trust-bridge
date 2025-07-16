-- Update the get_provider_visible_records function to exclude revoked permissions
CREATE OR REPLACE FUNCTION public.get_provider_visible_records(current_user_id uuid)
 RETURNS TABLE(id uuid, patient_id uuid, record_type text, encrypted_data text, created_at timestamp with time zone, permission_type text, patient_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    mr.id,
    mr.patient_id,
    mr.record_type,
    mr.encrypted_data,
    mr.created_at,
    sp.permission_type,
    COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name)) as patient_name
  FROM medical_records mr
  INNER JOIN sharing_permissions sp ON mr.id = sp.medical_record_id
  LEFT JOIN patients p ON mr.patient_id = p.id
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE sp.grantee_id = current_user_id
    AND sp.status = 'active'  -- Only show active (non-revoked) permissions
    AND (sp.expires_at IS NULL OR sp.expires_at > NOW());
END;
$function$;

-- Create revocation_events table for blockchain anchoring
CREATE TABLE IF NOT EXISTS public.revocation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id uuid NOT NULL REFERENCES public.sharing_permissions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  record_id uuid,
  event_hash text,
  anchored boolean DEFAULT false,
  blockchain_tx_hash text,
  created_at timestamptz DEFAULT now(),
  anchored_at timestamptz
);

-- Enable RLS on revocation_events
ALTER TABLE public.revocation_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for revocation_events
CREATE POLICY "Patients can view their own revocation events" 
ON public.revocation_events 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Providers can view revocation events for their records" 
ON public.revocation_events 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Service role can manage revocation events" 
ON public.revocation_events 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can insert revocation events" 
ON public.revocation_events 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_revocation_events_patient_id ON public.revocation_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_revocation_events_provider_id ON public.revocation_events(provider_id);
CREATE INDEX IF NOT EXISTS idx_revocation_events_anchored ON public.revocation_events(anchored) WHERE anchored = false;