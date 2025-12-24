-- First, run the auto_fix_business_id.sql to fix existing orders

-- Then run this to update venue column if it doesn't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS venue TEXT;

-- Update number_of_people for existing orders based on sessions
-- This is a one-time fix for orders that have sessions but no people count
UPDATE public.orders
SET number_of_people = (
    SELECT COALESCE(SUM((value->>'numberOfPeople')::int), 0)
    FROM jsonb_each(sessions)
)
WHERE number_of_people = 0 OR number_of_people IS NULL;

-- Verify the updates
SELECT 
    order_number,
    business_id,
    venue,
    number_of_people,
    event_type
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;
