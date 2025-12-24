-- 1. First, run this to see your users and copy the ID directly from here
SELECT id, email, created_at FROM auth.users;

-- 2. Once you have the ID from the result above, replace 'PASTE_ID_HERE' below
INSERT INTO public.businesses (id, user_id, email, name, phone, address, verified)
VALUES (
  'd592f784-b3af-4001-bba5-d00bbb4e1f76',
  'd592f784-b3af-4001-bba5-d00bbb4e1f76',
  'vishwa41434@gmail.com',
  'Manual Business',
  '1234567890',
  '123 Main St',
  true
);
