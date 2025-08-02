-- Fix Login Issues - RLS Policies Update
-- This script fixes the circular dependency in RLS policies that prevents users from logging in

-- ============================================================================
-- PART 1: DROP CONFLICTING POLICIES
-- ============================================================================

-- Drop existing profile policies that might cause conflicts
DROP POLICY IF EXISTS "Users can view profiles in their school" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Owners and managers can invite users" ON profiles;

-- ============================================================================
-- PART 2: CREATE SIMPLE, NON-CONFLICTING POLICIES
-- ============================================================================

-- Allow users to view their own profile (this should be the primary policy)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Allow users to view other profiles in their school (after they can access their own)
CREATE POLICY "Users can view profiles in their school" ON profiles
    FOR SELECT USING (
        school_id IN (
            SELECT p.school_id FROM profiles p
            WHERE p.id = auth.uid()
        )
    );

-- Allow owners and managers to create new user profiles (invitations)
CREATE POLICY "Owners and managers can invite users" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.role IN ('owner', 'manager')
            AND p.school_id = NEW.school_id
        )
    );

-- ============================================================================
-- PART 3: SIMPLIFY SCHOOLS POLICIES
-- ============================================================================

-- Drop existing school policies
DROP POLICY IF EXISTS "Users can view their own school" ON schools;
DROP POLICY IF EXISTS "Owners can update their school" ON schools;

-- Allow users to view their school
CREATE POLICY "Users can view their school" ON schools
    FOR SELECT USING (
        id IN (
            SELECT p.school_id FROM profiles p
            WHERE p.id = auth.uid()
        )
    );

-- Allow owners to update their school
CREATE POLICY "Owners can update their school" ON schools
    FOR UPDATE USING (
        id IN (
            SELECT p.school_id FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'owner'
        )
    );

-- ============================================================================
-- PART 4: ENSURE PROPER PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON schools TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- For development: Grant broader permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON POLICY "Users can view their own profile" ON profiles IS 'Primary policy - users must be able to access their own profile first';
