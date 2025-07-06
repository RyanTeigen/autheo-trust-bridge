-- Create trigger function to automatically enqueue hashes for anchoring
CREATE OR REPLACE FUNCTION enqueue_anchor_hash()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert hash into anchoring queue when a new record hash is created
  INSERT INTO hash_anchor_queue (record_id, hash)
  VALUES (NEW.record_id, NEW.hash);
  
  RAISE NOTICE 'Hash enqueued for anchoring: record_id=%, hash=%', NEW.record_id, LEFT(NEW.hash, 16);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the main operation
  RAISE WARNING 'Failed to enqueue hash for anchoring: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically enqueue hashes after record_hashes insert
DROP TRIGGER IF EXISTS trigger_enqueue_anchor ON record_hashes;
CREATE TRIGGER trigger_enqueue_anchor
  AFTER INSERT ON record_hashes
  FOR EACH ROW 
  EXECUTE FUNCTION enqueue_anchor_hash();