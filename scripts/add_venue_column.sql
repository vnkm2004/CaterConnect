-- Add venue column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS venue TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;
