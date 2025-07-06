-- Create a simple trigger function for now (without HTTP call)
-- This will be updated once pg_net extension is enabled
CREATE OR REPLACE FUNCTION call_hash_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Log that a record was created/updated
  RAISE NOTICE 'Medical record % was %: patient_id=%, provider_id=%', 
    NEW.id, lower(TG_OP), NEW.patient_id, NEW.provider_id;
  
  -- TODO: Add HTTP call to hash-record function once pg_net is enabled
  -- For now, this serves as a placeholder that logs operations
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_hash_record ON medical_records;
CREATE TRIGGER trigger_hash_record
  AFTER INSERT OR UPDATE ON medical_records
  FOR EACH ROW 
  EXECUTE FUNCTION call_hash_record();

-- Add comment for future reference
COMMENT ON FUNCTION call_hash_record() IS 'Trigger function to hash medical records. Requires pg_net extension to call hash-record edge function.';