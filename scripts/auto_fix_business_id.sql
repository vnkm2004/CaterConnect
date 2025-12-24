-- Automated fix: Update all NULL business_id orders with the first business

-- This will automatically assign all orders with NULL business_id 
-- to the first business in the businesses table

UPDATE public.orders 
SET business_id = (
    SELECT id 
    FROM public.businesses 
    LIMIT 1
)
WHERE business_id IS NULL;

-- Verify the fix
SELECT 
    o.order_number,
    o.business_id,
    b.name as business_name,
    o.event_type
FROM public.orders o
LEFT JOIN public.businesses b ON o.business_id = b.id
ORDER BY o.created_at DESC;
