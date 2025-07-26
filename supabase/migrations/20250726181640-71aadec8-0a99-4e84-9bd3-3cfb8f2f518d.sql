-- Update the current user's profile to have provider role
UPDATE profiles 
SET role = 'provider', updated_at = NOW()
WHERE id = auth.uid();