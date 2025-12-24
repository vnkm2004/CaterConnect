-- Check and fix business-order relationship

-- 1. Show all businesses with their IDs
SELECT 'All Businesses:' as section;
SELECT id, user_id, name, email FROM public.businesses;

-- 2. Show all orders
SELECT 'All Orders:' as section;
SELECT id, order_number, business_id, customer_id, event_type, venue, created_at 
FROM public.orders 
ORDER BY created_at DESC;

-- 3. Check if business IDs match order business_ids
SELECT 'Orders with Business Info:' as section;
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

-- 4. If businesses table has both id and user_id the same, 
-- check which one is being used in orders
SELECT 'Business ID vs User ID Check:' as section;
SELECT 
    b.id as business_id,
    b.user_id,
    b.name,
    (b.id = b.user_id) as ids_match
FROM public.businesses b;
