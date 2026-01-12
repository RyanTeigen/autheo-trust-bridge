-- P0 Security Hardening Migration
-- Fixes: 2 Security Definer Views, 18+ RLS Policies

-- ============================================
-- PART 1: Fix Security Definer Views
-- ============================================

-- Drop existing views that use SECURITY DEFINER
DROP VIEW IF EXISTS public.clinical_records;
DROP VIEW IF EXISTS public.patient_records;

-- Recreate clinical_records with SECURITY INVOKER (explicit)
CREATE VIEW public.clinical_records 
WITH (security_invoker = true) AS
SELECT 
    id, patient_id, provider_id, user_id, record_type,
    encrypted_data, iv, record_hash, anchored_at,
    created_at, updated_at,
    encrypted_key, encrypted_payload, encryption_scheme,
    'clinical'::text AS record_source
FROM public.medical_records
WHERE provider_id IS NOT NULL;

-- Recreate patient_records with SECURITY INVOKER (explicit)
CREATE VIEW public.patient_records
WITH (security_invoker = true) AS
SELECT 
    id, patient_id, provider_id, user_id, record_type,
    encrypted_data, iv, record_hash, anchored_at,
    created_at, updated_at,
    encrypted_key, encrypted_payload, encryption_scheme,
    'patient'::text AS record_source
FROM public.medical_records
WHERE provider_id IS NULL AND user_id IS NOT NULL;

-- ============================================
-- PART 2: Harden RLS Policies
-- ============================================

-- 1. access_logs: Only service_role can insert (audit logs)
DROP POLICY IF EXISTS "System can insert access logs" ON access_logs;
CREATE POLICY "Service role inserts access logs" 
ON access_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. access_request_audit: Service role only
DROP POLICY IF EXISTS "System can insert audit records" ON access_request_audit;
CREATE POLICY "Service role inserts audit records"
ON access_request_audit FOR INSERT
TO service_role  
WITH CHECK (true);

-- 3. anchored_hashes: Service role only (blockchain anchoring edge function)
DROP POLICY IF EXISTS "Service role can insert anchored hashes" ON anchored_hashes;
CREATE POLICY "Service role inserts anchored hashes"
ON anchored_hashes FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. appointment_access_mappings: Users can only manage their own
DROP POLICY IF EXISTS "System can manage appointment access mappings" ON appointment_access_mappings;
CREATE POLICY "Users manage own appointment mappings"
ON appointment_access_mappings FOR ALL
TO authenticated
USING (patient_id = auth.uid() OR provider_id = auth.uid())
WITH CHECK (patient_id = auth.uid() OR provider_id = auth.uid());

-- Add service role policy for system operations
CREATE POLICY "Service role manages appointment mappings"
ON appointment_access_mappings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. appointment_audit_trail: Service role only
DROP POLICY IF EXISTS "System can insert audit trail" ON appointment_audit_trail;
CREATE POLICY "Service role inserts audit trail"
ON appointment_audit_trail FOR INSERT
TO service_role
WITH CHECK (true);

-- 6. audit_anchors: Service role only (blockchain operations)
DROP POLICY IF EXISTS "Authenticated users can insert anchors" ON audit_anchors;
CREATE POLICY "Service role inserts audit anchors"
ON audit_anchors FOR INSERT
TO service_role
WITH CHECK (true);

-- 7. audit_hash_anchors: Service role only
DROP POLICY IF EXISTS "Authenticated users can insert hash anchors" ON audit_hash_anchors;
CREATE POLICY "Service role inserts hash anchors"
ON audit_hash_anchors FOR INSERT
TO service_role
WITH CHECK (true);

-- 8. audit_logs: Service role only (critical security table)
DROP POLICY IF EXISTS "Service role can insert all audit logs" ON audit_logs;
CREATE POLICY "Service role inserts audit logs"
ON audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- 9. compliance_metrics_history: Service role only
DROP POLICY IF EXISTS "System can insert metrics history" ON compliance_metrics_history;
CREATE POLICY "Service role inserts metrics"
ON compliance_metrics_history FOR INSERT
TO service_role
WITH CHECK (true);

-- 10. did_verifications: Authenticated only with proper checks
DROP POLICY IF EXISTS "Public can insert verification requests" ON did_verifications;
CREATE POLICY "Authenticated users insert verifications"
ON did_verifications FOR INSERT
TO authenticated
WITH CHECK (wallet_address IS NOT NULL AND nonce IS NOT NULL);

-- 11. enhanced_audit_logs: Service role only
DROP POLICY IF EXISTS "audit_logs_system_insert" ON enhanced_audit_logs;
CREATE POLICY "Service role inserts enhanced audit logs"
ON enhanced_audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- 12. patient_notifications: Service role for insert
DROP POLICY IF EXISTS "System can insert notifications" ON patient_notifications;
CREATE POLICY "Service role inserts patient notifications"
ON patient_notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- 13. production_metrics: Service role only
DROP POLICY IF EXISTS "System can insert production metrics" ON production_metrics;
CREATE POLICY "Service role inserts production metrics"
ON production_metrics FOR INSERT
TO service_role
WITH CHECK (true);

-- 14. provider_notifications: Service role only  
DROP POLICY IF EXISTS "System can insert provider notifications" ON provider_notifications;
CREATE POLICY "Service role inserts provider notifications"
ON provider_notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- 15. rate_limits: Service role only
DROP POLICY IF EXISTS "System can manage rate limits" ON rate_limits;
CREATE POLICY "Service role manages rate limits"
ON rate_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 16. record_anchors: Service role only (blockchain anchoring)
DROP POLICY IF EXISTS "Service role can insert anchors" ON record_anchors;
CREATE POLICY "Service role inserts record anchors"
ON record_anchors FOR INSERT
TO service_role
WITH CHECK (true);

-- 17. security_events: Service role only
DROP POLICY IF EXISTS "System can insert security events" ON security_events;
CREATE POLICY "Service role inserts security events"
ON security_events FOR INSERT
TO service_role
WITH CHECK (true);

-- 18. user_behavior_analytics: Service role only
DROP POLICY IF EXISTS "System can insert behavior analytics" ON user_behavior_analytics;
CREATE POLICY "Service role inserts analytics"
ON user_behavior_analytics FOR INSERT
TO service_role
WITH CHECK (true);

-- 19. user_sessions: User owns their session + service role
DROP POLICY IF EXISTS "system_manage_sessions" ON user_sessions;
CREATE POLICY "Users manage own sessions"
ON user_sessions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages all sessions"
ON user_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 3: Grant proper permissions on views
-- ============================================

GRANT SELECT ON public.clinical_records TO authenticated;
GRANT SELECT ON public.patient_records TO authenticated;