-- Migration: Replace first_name and last_name with single name column
-- Concatenate existing first_name and last_name into name column
-- Step 1: Add the new name column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(200);
-- Step 2: Populate name from first_name and last_name
UPDATE users
SET name = CONCAT(first_name, ' ', last_name)
WHERE name IS NULL;
-- Step 3: Make name NOT NULL after populating
ALTER TABLE users
ALTER COLUMN name
SET NOT NULL;
-- Step 4: Drop old columns
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;