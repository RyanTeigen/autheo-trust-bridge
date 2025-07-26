-- Update the user with email ryan.teigen921@gmail.com to have provider role
UPDATE profiles 
SET role = 'provider', updated_at = NOW()
WHERE email = 'ryan.teigen921@gmail.com';