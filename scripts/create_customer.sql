-- Create customer record for current user
-- First, find your user ID from auth.users
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then insert a customer record (replace USER_ID and EMAIL with your values)
-- INSERT INTO public.customers (id, email, name, phone)
-- VALUES (
--     'YOUR_USER_ID_HERE',
--     'your-email@example.com',
--     'Your Name',
--     'Your Phone'
-- );

-- Or use this to auto-create for the most recent user:
INSERT INTO public.customers (id, email, name, phone)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
    COALESCE(raw_user_meta_data->>'phone', '') as phone
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.customers)
ORDER BY created_at DESC
LIMIT 1;

-- Verify the customer was created
SELECT * FROM public.customers;
