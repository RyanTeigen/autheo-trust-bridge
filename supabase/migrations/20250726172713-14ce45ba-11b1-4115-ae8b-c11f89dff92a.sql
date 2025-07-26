-- Create necessary security infrastructure tables first

-- Create security events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    event_type text NOT NULL,
    severity text NOT NULL DEFAULT 'info',
    description text NOT NULL,
    metadata jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    resolved boolean DEFAULT false,
    resolved_at timestamp with time zone
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limiting (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    action text NOT NULL,
    ip_address inet,
    attempts integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    blocked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint to rate limiting table (handle if exists)
DO $$ 
BEGIN
    ALTER TABLE public.rate_limiting ADD CONSTRAINT rate_limiting_user_action_ip_key UNIQUE(user_id, action, ip_address);
EXCEPTION 
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

-- Create session security table
CREATE TABLE IF NOT EXISTS public.session_security (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    user_id uuid NOT NULL,
    risk_score integer DEFAULT 0,
    security_flags jsonb DEFAULT '{}',
    suspicious_activity boolean DEFAULT false,
    last_security_check timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint to session security table
DO $$ 
BEGIN
    ALTER TABLE public.session_security ADD CONSTRAINT session_security_session_id_key UNIQUE(session_id);
EXCEPTION 
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

-- Enable RLS on all security tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_security ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Compliance can view all security events" ON public.security_events
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('admin', 'compliance', 'security')
));

CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "System can manage rate limiting" ON public.rate_limiting
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own session security" ON public.session_security
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can manage session security" ON public.session_security
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create enhanced security functions
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
    action_name text,
    max_attempts integer DEFAULT 10,
    window_minutes integer DEFAULT 60,
    block_minutes integer DEFAULT 15
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_attempts integer := 0;
    is_blocked boolean := false;
    window_start_time timestamp with time zone;
BEGIN
    -- Check if user is currently blocked
    SELECT blocked_until > now() INTO is_blocked
    FROM rate_limiting
    WHERE user_id = auth.uid()
    AND action = action_name
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF is_blocked THEN
        RETURN false;
    END IF;
    
    -- Calculate window start time
    window_start_time := now() - (window_minutes || ' minutes')::interval;
    
    -- Count attempts in current window
    SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
    FROM rate_limiting
    WHERE user_id = auth.uid()
    AND action = action_name
    AND window_start >= window_start_time;
    
    -- If over limit, block user
    IF current_attempts >= max_attempts THEN
        INSERT INTO rate_limiting (user_id, action, attempts, blocked_until)
        VALUES (
            auth.uid(),
            action_name,
            1,
            now() + (block_minutes || ' minutes')::interval
        );
        RETURN false;
    END IF;
    
    -- Record this attempt
    INSERT INTO rate_limiting (user_id, action, attempts)
    VALUES (auth.uid(), action_name, 1);
    
    RETURN true;
END;
$function$;