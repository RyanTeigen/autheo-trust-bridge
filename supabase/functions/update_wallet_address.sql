
CREATE OR REPLACE FUNCTION update_wallet_address(user_id UUID, wallet TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET wallet_address = wallet
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
