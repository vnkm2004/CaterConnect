-- Add the missing user_id column to the businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;

-- Update existing rows to set user_id = id (if any exist)
UPDATE public.businesses 
SET user_id = id 
WHERE user_id IS NULL;
