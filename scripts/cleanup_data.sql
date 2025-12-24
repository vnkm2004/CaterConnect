-- Cleanup Data Script
-- Run this in Supabase SQL Editor to remove all test data

-- Delete all orders
DELETE FROM orders;

-- Optional: Delete all customers (if you want to force re-login/profile creation)
-- DELETE FROM customers;

-- Optional: Delete all businesses (if you want to force re-registration)
-- DELETE FROM businesses;
