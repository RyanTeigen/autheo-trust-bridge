-- Update the current user's role to provider so they can access both patient and provider portals
UPDATE profiles 
SET role = 'provider'::user_role, 
    updated_at = now()
WHERE email = 'ryan.teigen921@gmail.com';