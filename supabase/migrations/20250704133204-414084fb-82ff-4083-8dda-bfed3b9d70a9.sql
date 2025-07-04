-- Create missing user profile
INSERT INTO public.profiles (id, first_name, last_name, email, role)
VALUES (
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613',
  'Ryan',
  'Teigen', 
  'ryan.teigen921@gmail.com',
  'patient'
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;