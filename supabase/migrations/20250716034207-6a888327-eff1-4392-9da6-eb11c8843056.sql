-- Add record_type column to existing hash_anchor_queue table
ALTER TABLE hash_anchor_queue 
ADD COLUMN IF NOT EXISTS record_type text DEFAULT 'medical_record';

-- Create provider_submit_record function
CREATE OR REPLACE FUNCTION provider_submit_record(
  provider_id_param uuid,
  patient_id_param uuid,
  record_type_param text,
  encrypted_data_param text,
  iv_param text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_record_id uuid;
  record_hash text;
  hash_input text;
BEGIN
  -- Step 1: Insert the encrypted medical record
  INSERT INTO medical_records (
    provider_id, 
    patient_id, 
    record_type, 
    encrypted_data, 
    iv,
    user_id
  )
  VALUES (
    provider_id_param, 
    patient_id_param, 
    record_type_param, 
    encrypted_data_param, 
    iv_param,
    provider_id_param
  )
  RETURNING id INTO new_record_id;

  -- Step 2: Generate hash for the record
  hash_input := new_record_id::text || encrypted_data_param || record_type_param || EXTRACT(EPOCH FROM NOW())::text;
  record_hash := encode(digest(hash_input, 'sha256'), 'hex');

  -- Step 3: Queue the record hash for blockchain anchoring
  INSERT INTO hash_anchor_queue (
    record_type, 
    record_id, 
    hash, 
    patient_id, 
    provider_id
  )
  VALUES (
    'medical_record', 
    new_record_id, 
    record_hash, 
    patient_id_param, 
    provider_id_param
  );

  -- Step 4: Insert audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    status,
    details
  ) VALUES (
    provider_id_param,
    'CREATE_MEDICAL_RECORD',
    'medical_records',
    new_record_id,
    'success',
    'Provider created medical record for patient'
  );

  RETURN new_record_id;
END;
$$;