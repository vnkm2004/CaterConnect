-- 1. View all unverified businesses
SELECT email, name, phone, verified, created_at 
FROM businesses 
WHERE verified = false;

-- 2. To verify a specific business, replace 'EMAIL_HERE' with the actual email
-- UPDATE businesses 
-- SET verified = true 
-- WHERE email = 'business@example.com';

-- 3. To verify ALL businesses at once (for testing)
-- UPDATE businesses 
-- SET verified = true;
