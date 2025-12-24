-- Fix: Update orders with correct business_id

-- Step 1: First, let's see what business exists
SELECT id, name, email FROM public.businesses;

-- Step 2: Update all orders to use that business_id
-- IMPORTANT: Replace 'YOUR_BUSINESS_ID_HERE' with the actual ID from Step 1

-- UPDATE public.orders 
-- SET business_id = 'YOUR_BUSINESS_ID_HERE'
-- WHERE business_id IS NULL;

-- Step 3: Verify the update worked
-- SELECT order_number, business_id FROM public.orders;
