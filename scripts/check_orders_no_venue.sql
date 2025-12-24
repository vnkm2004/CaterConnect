-- SIMPLE queries - run ONE AT A TIME

-- Query 1: Show businesses
SELECT id, name FROM public.businesses;

-- Query 2: Show orders (without venue for now)
SELECT id, order_number, business_id, event_type FROM public.orders;

-- Query 3: Match orders to businesses
SELECT 
    o.order_number,
    o.business_id,
    b.name as business_name
FROM public.orders o
LEFT JOIN public.businesses b ON o.business_id = b.id;
