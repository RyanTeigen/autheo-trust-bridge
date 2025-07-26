-- Add new notification types for enhanced medical communication
-- This migration adds support for medical test results, cross-hospital sharing, 
-- critical updates, provider communication, and system notifications

-- Create enum for notification types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM (
        'access_request',
        'access_granted', 
        'access_revoked',
        'access_expired',
        'access_auto_approved',
        'appointment_access_request',
        'cross_hospital_request',
        'cross_hospital_approved',
        'cross_hospital_denied',
        'medical_test_result',
        'critical_medical_update',
        'provider_communication',
        'system_update',
        'security_alert',
        'lab_result_available',
        'imaging_result_available',
        'prescription_ready',
        'appointment_reminder',
        'medication_refill_due'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create medical test results notifications table
CREATE TABLE IF NOT EXISTS medical_test_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    test_type TEXT NOT NULL, -- 'blood_test', 'imaging', 'x_ray', 'mri', 'ct_scan', etc.
    test_name TEXT NOT NULL,
    result_status TEXT NOT NULL DEFAULT 'available', -- 'available', 'critical', 'normal', 'abnormal'
    provider_id UUID NOT NULL,
    medical_record_id UUID REFERENCES medical_records(id),
    result_summary TEXT,
    requires_action BOOLEAN DEFAULT false,
    action_required TEXT,
    priority_level TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'high', 'urgent', 'critical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on medical test notifications
ALTER TABLE medical_test_notifications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own test notifications
CREATE POLICY "Patients can view their own test notifications" 
ON medical_test_notifications 
FOR SELECT 
USING (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
));

-- Providers can create test notifications for their patients
CREATE POLICY "Providers can create test notifications" 
ON medical_test_notifications 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

-- Patients can update acknowledgment of their notifications
CREATE POLICY "Patients can acknowledge their test notifications" 
ON medical_test_notifications 
FOR UPDATE 
USING (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
))
WITH CHECK (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
));

-- Create critical medical updates table
CREATE TABLE IF NOT EXISTS critical_medical_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    update_type TEXT NOT NULL, -- 'medication_change', 'allergy_alert', 'emergency_contact', 'treatment_plan'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity_level TEXT NOT NULL DEFAULT 'high', -- 'high', 'urgent', 'critical'
    requires_immediate_attention BOOLEAN DEFAULT true,
    acknowledgment_required BOOLEAN DEFAULT true,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    related_record_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Enable RLS on critical medical updates
ALTER TABLE critical_medical_updates ENABLE ROW LEVEL SECURITY;

-- Patients can view their own critical updates
CREATE POLICY "Patients can view their own critical updates" 
ON critical_medical_updates 
FOR SELECT 
USING (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
));

-- Providers can create critical updates for their patients
CREATE POLICY "Providers can create critical updates" 
ON critical_medical_updates 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

-- Patients can acknowledge their critical updates
CREATE POLICY "Patients can acknowledge critical updates" 
ON critical_medical_updates 
FOR UPDATE 
USING (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
))
WITH CHECK (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
));

-- Create provider communications table
CREATE TABLE IF NOT EXISTS provider_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    communication_type TEXT NOT NULL, -- 'message', 'reminder', 'instruction', 'follow_up'
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    requires_response BOOLEAN DEFAULT false,
    response_deadline TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on provider communications
ALTER TABLE provider_communications ENABLE ROW LEVEL SECURITY;

-- Patients can view communications sent to them
CREATE POLICY "Patients can view their communications" 
ON provider_communications 
FOR SELECT 
USING (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
));

-- Providers can create communications for their patients
CREATE POLICY "Providers can create communications" 
ON provider_communications 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

-- Patients can respond to communications
CREATE POLICY "Patients can respond to communications" 
ON provider_communications 
FOR UPDATE 
USING (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
))
WITH CHECK (patient_id IN (
    SELECT patients.id FROM patients WHERE patients.user_id = auth.uid()
));

-- Create system notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- NULL for system-wide notifications
    notification_type TEXT NOT NULL, -- 'system_update', 'security_alert', 'maintenance', 'feature_update'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
    affects_all_users BOOLEAN DEFAULT false,
    target_user_roles TEXT[] DEFAULT ARRAY['patient'], -- 'patient', 'provider', 'admin'
    action_required BOOLEAN DEFAULT false,
    action_url TEXT,
    action_text TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Enable RLS on system notifications
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view system notifications targeted to them or system-wide
CREATE POLICY "Users can view relevant system notifications" 
ON system_notifications 
FOR SELECT 
USING (
    user_id = auth.uid() OR 
    affects_all_users = true OR 
    (
        user_id IS NULL AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role::text = ANY(target_user_roles)
        )
    )
);

-- Users can update read/dismissed status of their notifications
CREATE POLICY "Users can update their system notification status" 
ON system_notifications 
FOR UPDATE 
USING (user_id = auth.uid() OR affects_all_users = true)
WITH CHECK (user_id = auth.uid() OR affects_all_users = true);

-- Admins can manage all system notifications
CREATE POLICY "Admins can manage system notifications" 
ON system_notifications 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role::text IN ('admin', 'compliance')
    )
);

-- Create function to automatically create patient notifications for medical test results
CREATE OR REPLACE FUNCTION create_test_result_notification()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
    provider_name TEXT;
    notification_title TEXT;
    notification_message TEXT;
    notification_priority TEXT;
BEGIN
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Your Healthcare Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.provider_id;
    
    -- Set notification details based on result status
    CASE NEW.result_status
        WHEN 'critical' THEN
            notification_title := '🚨 Critical Test Result Available';
            notification_priority := 'urgent';
        WHEN 'abnormal' THEN
            notification_title := '⚠️ Test Result Requires Attention';
            notification_priority := 'high';
        ELSE
            notification_title := '📋 Test Result Available';
            notification_priority := 'normal';
    END CASE;
    
    -- Create notification message
    notification_message := format('Your %s results from %s are now available. %s',
        NEW.test_name,
        provider_name,
        CASE 
            WHEN NEW.requires_action THEN 'Please review and follow the recommended actions.'
            ELSE 'Please review when convenient.'
        END
    );
    
    -- Insert notification
    INSERT INTO patient_notifications (
        patient_id,
        notification_type,
        title,
        message,
        priority,
        data,
        created_at,
        expires_at
    ) VALUES (
        NEW.patient_id,
        'medical_test_result',
        notification_title,
        notification_message,
        notification_priority,
        jsonb_build_object(
            'test_notification_id', NEW.id,
            'test_type', NEW.test_type,
            'test_name', NEW.test_name,
            'result_status', NEW.result_status,
            'provider_id', NEW.provider_id,
            'provider_name', provider_name,
            'requires_action', NEW.requires_action,
            'action_required', NEW.action_required
        ),
        NOW(),
        COALESCE(NEW.expires_at, NOW() + INTERVAL '30 days')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for test result notifications
DROP TRIGGER IF EXISTS create_test_result_notification_trigger ON medical_test_notifications;
CREATE TRIGGER create_test_result_notification_trigger
AFTER INSERT ON medical_test_notifications
FOR EACH ROW
EXECUTE FUNCTION create_test_result_notification();

-- Create function to automatically create notifications for critical medical updates
CREATE OR REPLACE FUNCTION create_critical_update_notification()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
    provider_name TEXT;
BEGIN
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Your Healthcare Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.provider_id;
    
    -- Insert notification
    INSERT INTO patient_notifications (
        patient_id,
        notification_type,
        title,
        message,
        priority,
        data,
        created_at,
        expires_at
    ) VALUES (
        NEW.patient_id,
        'critical_medical_update',
        NEW.title,
        NEW.message,
        CASE NEW.severity_level
            WHEN 'critical' THEN 'urgent'
            WHEN 'urgent' THEN 'urgent'
            ELSE 'high'
        END,
        jsonb_build_object(
            'critical_update_id', NEW.id,
            'update_type', NEW.update_type,
            'provider_id', NEW.provider_id,
            'provider_name', provider_name,
            'severity_level', NEW.severity_level,
            'requires_immediate_attention', NEW.requires_immediate_attention,
            'acknowledgment_required', NEW.acknowledgment_required,
            'metadata', NEW.metadata
        ),
        NOW(),
        NEW.expires_at
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for critical update notifications
DROP TRIGGER IF EXISTS create_critical_update_notification_trigger ON critical_medical_updates;
CREATE TRIGGER create_critical_update_notification_trigger
AFTER INSERT ON critical_medical_updates
FOR EACH ROW
EXECUTE FUNCTION create_critical_update_notification();

-- Create function to automatically create notifications for provider communications
CREATE OR REPLACE FUNCTION create_provider_communication_notification()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
    provider_name TEXT;
    notification_title TEXT;
    notification_priority TEXT;
BEGIN
    -- Get patient name
    SELECT COALESCE(p.full_name, CONCAT(pr.first_name, ' ', pr.last_name), 'Patient')
    INTO patient_name
    FROM patients p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.patient_id;
    
    -- Get provider name
    SELECT COALESCE(CONCAT(first_name, ' ', last_name), email, 'Your Healthcare Provider')
    INTO provider_name
    FROM profiles
    WHERE id = NEW.provider_id;
    
    -- Set notification details based on communication type
    CASE NEW.communication_type
        WHEN 'reminder' THEN
            notification_title := '🔔 Reminder from ' || provider_name;
        WHEN 'instruction' THEN
            notification_title := '📋 Instructions from ' || provider_name;
        WHEN 'follow_up' THEN
            notification_title := '👩‍⚕️ Follow-up from ' || provider_name;
        ELSE
            notification_title := '💬 Message from ' || provider_name;
    END CASE;
    
    -- Set priority
    notification_priority := CASE NEW.priority
        WHEN 'urgent' THEN 'urgent'
        WHEN 'high' THEN 'high'
        ELSE 'normal'
    END;
    
    -- Insert notification
    INSERT INTO patient_notifications (
        patient_id,
        notification_type,
        title,
        message,
        priority,
        data,
        created_at
    ) VALUES (
        NEW.patient_id,
        'provider_communication',
        notification_title,
        format('%s: %s', NEW.subject, LEFT(NEW.message, 100) || CASE WHEN LENGTH(NEW.message) > 100 THEN '...' ELSE '' END),
        notification_priority,
        jsonb_build_object(
            'communication_id', NEW.id,
            'communication_type', NEW.communication_type,
            'subject', NEW.subject,
            'provider_id', NEW.provider_id,
            'provider_name', provider_name,
            'requires_response', NEW.requires_response,
            'response_deadline', NEW.response_deadline,
            'priority', NEW.priority
        ),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for provider communication notifications
DROP TRIGGER IF EXISTS create_provider_communication_notification_trigger ON provider_communications;
CREATE TRIGGER create_provider_communication_notification_trigger
AFTER INSERT ON provider_communications
FOR EACH ROW
EXECUTE FUNCTION create_provider_communication_notification();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_medical_test_notifications_updated_at
BEFORE UPDATE ON medical_test_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_critical_medical_updates_updated_at
BEFORE UPDATE ON critical_medical_updates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_communications_updated_at
BEFORE UPDATE ON provider_communications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_notifications_updated_at
BEFORE UPDATE ON system_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();