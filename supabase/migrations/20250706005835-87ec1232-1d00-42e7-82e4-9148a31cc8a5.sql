-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Trigger function to call the hash-record edge function
CREATE OR REPLACE FUNCTION call_hash_record()
RETURNS TRIGGER AS $$
DECLARE
  response_body TEXT;
BEGIN
  -- Call the hash-record edge function
  SELECT content INTO response_body
  FROM http((
    'POST',
    'https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/hash-record',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || current_setting('app.service_role_key', true))
    ],
    'application/json',
    json_build_object(
      'record_id', NEW.id,
      'operation', lower(TG_OP),
      'payload', row_to_json(NEW),
      'patient_id', NEW.patient_id,
      'provider_id', NEW.provider_id,
      'signer_id', COALESCE(NEW.user_id, NEW.provider_id)
    )::text
  ));

  -- Log the response for debugging
  RAISE NOTICE 'Hash record response: %', response_body;
  
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;