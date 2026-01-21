-- Migration: Update user roles from (user, admin, manager) to (customer, supplier, staff, admin)
-- Run this script to migrate existing data to new role structure
-- Step 1: Add new enum type
DO $$ BEGIN CREATE TYPE user_role_new AS ENUM ('customer', 'supplier', 'staff', 'admin');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Step 2: Alter the column to use the new enum type
-- First, drop the default
ALTER TABLE users
ALTER COLUMN role DROP DEFAULT;
-- Step 3: Map old roles to new roles
-- user -> customer
-- manager -> staff  
-- admin -> admin (no change)
ALTER TABLE users
ALTER COLUMN role TYPE user_role_new USING (
        CASE
            role::text
            WHEN 'user' THEN 'customer'::user_role_new
            WHEN 'manager' THEN 'staff'::user_role_new
            WHEN 'admin' THEN 'admin'::user_role_new
            ELSE 'customer'::user_role_new
        END
    );
-- Step 4: Set new default
ALTER TABLE users
ALTER COLUMN role
SET DEFAULT 'customer'::user_role_new;
-- Step 5: Drop old enum type and rename new one
DROP TYPE IF EXISTS user_role;
ALTER TYPE user_role_new
RENAME TO user_role;
-- Verify the migration
SELECT DISTINCT role
FROM users;