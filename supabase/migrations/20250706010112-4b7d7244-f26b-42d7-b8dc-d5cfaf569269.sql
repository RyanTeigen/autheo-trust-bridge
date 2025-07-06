-- Enable pg_net extension for HTTP requests
SELECT net.enable_extension('pg_net');

-- Trigger function to call the hash-record edge function
CREATE OR REPLACE FUNCTION call_hash_record()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the hash-record edge function using pg_net
  SELECT net.http_post(
    url := 'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/hash-record',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHp6cm9hZmVkYnl0dGRmeXBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMyMDMzMiwiZXhwIjoyMDYyODk2MzMyfQ.8Qg7nEhLnhVb4Z1I_3WEqmfHJLsJvdHhKJLtG7oCmg8'
    ),
    body := jsonb_build_object(
      'record_id', NEW.id,
      'operation', lower(TG_OP),
      'payload', to_jsonb(NEW),
      'patient_id', NEW.patient_id,
      'provider_id', NEW.provider_id,
      'signer_id', COALESCE(NEW.user_id, NEW.provider_id)
    )
  ) INTO request_id;

  -- Log the request for debugging
  RAISE NOTICE 'Hash record request ID: %', request_id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the main operation
  RAISE WARNING 'Failed to call hash-record function: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_hash_record ON medical_records;
CREATE TRIGGER trigger_hash_record
  AFTER INSERT OR UPDATE ON medical_records
  FOR EACH ROW 
  EXECUTE FUNCTION call_hash_record();