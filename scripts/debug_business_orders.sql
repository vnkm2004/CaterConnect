-- Debug script to check business and order relationships

-- 1. Check current user
SELECT 'Current Auth Users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Check businesses table
SELECT 'Businesses:' as info;
SELECT id, user_id, name, email FROM public.businesses ORDER BY created_at DESC LIMIT 5;

-- 3. Check orders table
SELECT 'Orders:' as info;
SELECT id, order_number, business_id, customer_id, event_type, status, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check if business has user_id column
SELECT 'Business Table Columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public';

-- 5. Find orders for a specific business (replace with actual business ID)
-- SELECT * FROM public.orders WHERE business_id = 'YOUR_BUSINESS_ID_HERE';
