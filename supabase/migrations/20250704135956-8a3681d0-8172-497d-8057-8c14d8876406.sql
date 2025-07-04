-- Ensure the current user has a patient record
INSERT INTO public.patients (
  id, 
  user_id, 
  full_name, 
  email,
  created_at,
  updated_at
)
VALUES (
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613',
  'cfc9f9d5-0548-413a-bdb6-e691f3c33613',
  'Ryan Teigen',
  'ryan.teigen921@gmail.com',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = now();