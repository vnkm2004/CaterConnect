-- Simple query to check business-order relationship
-- Run each SELECT separately

-- 1. Show all businesses
SELECT id, user_id, name, email FROM public.businesses;

-- 2. Show all orders
SELECT id, order_number, business_id, customer_id, event_type, venue, created_at 
FROM public.orders 
ORDER BY created_at DESC;

-- 3. Check if business IDs match order business_ids
SELECT 
    o.id,
    o.order_number,
    o.business_id,
    b.name as business_name,
    o.event_type,
    o.venue
FROM public.orders o
LEFT JOIN public.businesses b ON o.business_id = b.id
ORDER BY o.created_at DESC;
