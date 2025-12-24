-- MAGIC SCRIPT: This will find your last created user and make them a business.
-- You do NOT need to copy-paste any IDs. Just Run this.

INSERT INTO public.businesses (id, user_id, email, name, phone, address, verified)
SELECT id, id, email, 'Auto Created Business', '1234567890', '123 Auto St', true
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;
