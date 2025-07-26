-- Fix security warnings by setting search_path for new functions
ALTER FUNCTION create_test_result_notification() SET search_path = 'public';
ALTER FUNCTION create_critical_update_notification() SET search_path = 'public';  
ALTER FUNCTION create_provider_communication_notification() SET search_path = 'public';