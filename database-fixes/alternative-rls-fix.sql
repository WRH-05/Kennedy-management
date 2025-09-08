-- Alternative: Modify RLS Policy to Allow Anonymous School Creation
-- WARNING: This is less secure but simpler to implement

-- Drop existing RLS policy for schools INSERT
DROP POLICY IF EXISTS "Users can insert schools" ON schools;

-- Create new policy that allows anonymous users to create schools
-- This is needed for the owner registration process
CREATE POLICY "Allow school creation during registration" ON schools
    FOR INSERT
    TO public  -- This includes both authenticated and anonymous users
    WITH CHECK (true);  -- Allow any school creation

-- Keep other policies restrictive (SELECT, UPDATE, DELETE still require authentication)
-- You should have separate policies for those operations that check for proper authentication

-- Add a comment explaining why this is needed
COMMENT ON POLICY "Allow school creation during registration" ON schools IS 
'Allows anonymous users to create schools during owner registration. This is necessary because the school must be created before the user account exists.';

-- Optional: Add a more restrictive policy later that checks for school ownership
-- This would require updating your application logic to handle multi-step registration
