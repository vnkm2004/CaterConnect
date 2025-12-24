-- Check the current sessions data structure
SELECT 
    order_number,
    sessions,
    number_of_people,
    venue
FROM public.orders 
WHERE order_number = '202511280007'
LIMIT 1;

-- This will show us what the sessions data looks like
