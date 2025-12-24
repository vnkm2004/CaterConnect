-- Add custom 10-digit numeric IDs for customers and businesses
-- Run this script in Supabase SQL Editor

-- Step 1: Add custom_id columns
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS custom_id VARCHAR(10) UNIQUE;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS custom_id VARCHAR(10) UNIQUE;

-- Step 2: Create function to generate 10-digit random number
CREATE OR REPLACE FUNCTION generate_custom_id()
RETURNS VARCHAR(10) AS $$
DECLARE
    new_id VARCHAR(10);
BEGIN
    -- Generate random 10-digit number (1000000000 to 9999999999)
    new_id := LPAD(FLOOR(RANDOM() * 9000000000 + 1000000000)::TEXT, 10, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger function for customers (uses phone number if available and unique)
CREATE OR REPLACE FUNCTION set_customer_custom_id()
RETURNS TRIGGER AS $$
DECLARE
    phone_digits VARCHAR(10);
BEGIN
    IF NEW.custom_id IS NULL THEN
        -- Extract only digits from phone number
        phone_digits := REGEXP_REPLACE(COALESCE(NEW.phone, ''), '[^0-9]', '', 'g');
        
        -- Check if phone has exactly 10 digits and is unique
        IF LENGTH(phone_digits) = 10 AND NOT EXISTS (
            SELECT 1 FROM public.customers WHERE custom_id = phone_digits AND id != NEW.id
        ) THEN
            NEW.custom_id := phone_digits;
        ELSE
            -- Generate random 10-digit ID if phone is invalid or already exists
            NEW.custom_id := generate_custom_id();
            WHILE EXISTS (SELECT 1 FROM public.customers WHERE custom_id = NEW.custom_id AND id != NEW.id) LOOP
                NEW.custom_id := generate_custom_id();
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger function for businesses (uses phone number if available and unique)
CREATE OR REPLACE FUNCTION set_business_custom_id()
RETURNS TRIGGER AS $$
DECLARE
    phone_digits VARCHAR(10);
BEGIN
    IF NEW.custom_id IS NULL THEN
        -- Extract only digits from phone number
        phone_digits := REGEXP_REPLACE(COALESCE(NEW.phone, ''), '[^0-9]', '', 'g');
        
        -- Check if phone has exactly 10 digits and is unique
        IF LENGTH(phone_digits) = 10 AND NOT EXISTS (
            SELECT 1 FROM public.businesses WHERE custom_id = phone_digits AND id != NEW.id
        ) THEN
            NEW.custom_id := phone_digits;
        ELSE
            -- Generate random 10-digit ID if phone is invalid or already exists
            NEW.custom_id := generate_custom_id();
            WHILE EXISTS (SELECT 1 FROM public.businesses WHERE custom_id = NEW.custom_id AND id != NEW.id) LOOP
                NEW.custom_id := generate_custom_id();
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create triggers
DROP TRIGGER IF EXISTS trigger_set_customer_custom_id ON public.customers;
CREATE TRIGGER trigger_set_customer_custom_id
    BEFORE INSERT OR UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION set_customer_custom_id();

DROP TRIGGER IF EXISTS trigger_set_business_custom_id ON public.businesses;
CREATE TRIGGER trigger_set_business_custom_id
    BEFORE INSERT OR UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION set_business_custom_id();

-- Step 6: Update existing records to have custom IDs (if any exist)
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Update customers
    FOR rec IN SELECT id, phone FROM public.customers WHERE custom_id IS NULL
    LOOP
        UPDATE public.customers 
        SET custom_id = NULL 
        WHERE id = rec.id;
    END LOOP;
    
    -- Update businesses
    FOR rec IN SELECT id, phone FROM public.businesses WHERE custom_id IS NULL
    LOOP
        UPDATE public.businesses 
        SET custom_id = NULL 
        WHERE id = rec.id;
    END LOOP;
END $$;

-- Step 7: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_custom_id ON public.customers(custom_id);
CREATE INDEX IF NOT EXISTS idx_businesses_custom_id ON public.businesses(custom_id);
