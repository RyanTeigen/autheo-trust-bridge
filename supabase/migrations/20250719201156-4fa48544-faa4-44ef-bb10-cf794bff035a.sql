
-- Create provider_notifications table for cross-hospital notifications
CREATE TABLE public.provider_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on provider_notifications
ALTER TABLE public.provider_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for provider_notifications
CREATE POLICY "Providers can view their own notifications" 
ON public.provider_notifications 
FOR SELECT 
USING (provider_id = auth.uid());

CREATE POLICY "Providers can update their own notifications" 
ON public.provider_notifications 
FOR UPDATE 
USING (provider_id = auth.uid());

CREATE POLICY "System can insert provider notifications" 
ON public.provider_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create function to handle cross-hospital request notifications
CREATE OR REPLACE FUNCTION public.notify_provider_cross_hospital_decision()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  hospital_name TEXT;
BEGIN
  -- Only create notification if status changed to approved or denied
  IF NEW.status IN ('approved', 'denied') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Unknown Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get hospital name
    SELECT hospital_name INTO hospital_name
    FROM hospital_registry
    WHERE hospital_id = NEW.requesting_hospital_id;
    
    -- Insert notification for the provider
    INSERT INTO provider_notifications (
      provider_id,
      notification_type,
      title,
      message,
      priority,
      data,
      created_at
    ) VALUES (
      NEW.provider_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'cross_hospital_approved'
        ELSE 'cross_hospital_denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN '✅ Cross-Hospital Access Approved'
        ELSE '❌ Cross-Hospital Access Denied'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 
          format('Patient %s has approved your cross-hospital access request. You can now access their medical records from %s.',
            COALESCE(patient_name, 'Unknown Patient'),
            COALESCE(hospital_name, 'the requesting hospital'))
        ELSE 
          format('Patient %s has denied your cross-hospital access request from %s.',
            COALESCE(patient_name, 'Unknown Patient'),
            COALESCE(hospital_name, 'the requesting hospital'))
      END,
      CASE 
        WHEN NEW.urgency_level = 'emergency' THEN 'urgent'
        WHEN NEW.urgency_level = 'urgent' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'request_id', NEW.id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'hospital_name', hospital_name,
        'status', NEW.status,
        'request_type', NEW.request_type,
        'urgency_level', NEW.urgency_level,
        'decision_date', NEW.updated_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cross_hospital_requests table
DROP TRIGGER IF EXISTS on_cross_hospital_decision ON cross_hospital_requests;
CREATE TRIGGER on_cross_hospital_decision
  AFTER UPDATE ON cross_hospital_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_provider_cross_hospital_decision();

-- Add updated_at trigger for provider_notifications
CREATE OR REPLACE FUNCTION public.update_provider_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_notifications_updated_at
  BEFORE UPDATE ON public.provider_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_notifications_updated_at();
