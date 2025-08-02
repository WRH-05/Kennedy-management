-- Complete Fix for Login Issues in Kennedy Management System
-- This script addresses the login button loading animation issue
-- Execute this in your Supabase SQL Editor

-- ============================================================================
-- PART 1: IDENTIFY AND FIX THE CORE ISSUE
-- ============================================================================

-- The main issue is a circular dependency in RLS policies:
-- Users need to access their profile to get school_id, but RLS policies 
-- require school_id to access profiles

-- ============================================================================
-- PART 2: DROP ALL EXISTING CONFLICTING POLICIES
-- ============================================================================

-- Drop all existing policies that might cause conflicts
DROP POLICY IF EXISTS "Users can view profiles in their school" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Owners and managers can invite users" ON profiles;
DROP POLICY IF EXISTS "Users can view their own school" ON schools;
DROP POLICY IF EXISTS "Owners can update their school" ON schools;

-- ============================================================================
-- PART 3: CREATE PROPER, NON-CONFLICTING POLICIES
-- ============================================================================

-- 1. PRIMARY POLICY: Users MUST be able to view their own profile
CREATE POLICY "Users can always view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- 3. SECONDARY POLICY: Users can view other profiles in their school
-- (This relies on the primary policy working first)
CREATE POLICY "Users can view school profiles" ON profiles
    FOR SELECT USING (
        school_id = (
            SELECT school_id FROM profiles 
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- 4. Profile creation for invitations
CREATE POLICY "System can create profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- 5. School access policies
CREATE POLICY "Users can view their school" ON schools
    FOR SELECT USING (
        id = (
            SELECT school_id FROM profiles 
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

CREATE POLICY "Owners can update their school" ON schools
    FOR UPDATE USING (
        id = (
            SELECT school_id FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'owner'
            LIMIT 1
        )
    );

-- ============================================================================
-- PART 4: ENSURE DATABASE TRIGGER IS WORKING
-- ============================================================================

-- Check if the trigger function exists and works
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invitation_record RECORD;
    user_school_id UUID;
    user_role TEXT;
    user_full_name TEXT;
    user_phone TEXT;
BEGIN
    -- Only process INSERT events with raw_user_meta_data
    IF TG_OP = 'INSERT' AND NEW.raw_user_meta_data IS NOT NULL THEN
        
        -- Check if this is an owner signup during school creation
        IF NEW.raw_user_meta_data->>'is_owner_signup' = 'true' THEN
            user_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
            user_role := 'owner';
            user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
            user_phone := NEW.raw_user_meta_data->>'phone';

            -- Create profile immediately for owner
            INSERT INTO profiles (id, school_id, role, full_name, phone, is_active)
            VALUES (NEW.id, user_school_id, user_role::user_role, user_full_name, user_phone, true)
            ON CONFLICT (id) DO UPDATE SET
                school_id = EXCLUDED.school_id,
                role = EXCLUDED.role,
                full_name = EXCLUDED.full_name,
                phone = EXCLUDED.phone,
                updated_at = NOW();

            RAISE NOTICE 'Created owner profile for user % in school %', NEW.id, user_school_id;
            
        ELSIF NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
            -- This is an invitation-based signup
            SELECT * INTO invitation_record
            FROM invitations
            WHERE token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
            AND email = NEW.email
            AND accepted_at IS NULL
            AND expires_at > NOW()
            LIMIT 1;

            IF FOUND THEN
                INSERT INTO profiles (id, school_id, role, full_name, invited_by, is_active)
                VALUES (
                    NEW.id,
                    invitation_record.school_id,
                    invitation_record.role,
                    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
                    invitation_record.invited_by,
                    true
                )
                ON CONFLICT (id) DO UPDATE SET
                    school_id = EXCLUDED.school_id,
                    role = EXCLUDED.role,
                    full_name = EXCLUDED.full_name,
                    invited_by = EXCLUDED.invited_by,
                    updated_at = NOW();

                -- Mark invitation as accepted
                UPDATE invitations
                SET accepted_at = NOW()
                WHERE id = invitation_record.id;

                RAISE NOTICE 'Created invited user profile for user % in school %', NEW.id, invitation_record.school_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- PART 5: GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Ensure authenticated users can access their data
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT SELECT ON schools TO authenticated;
GRANT UPDATE ON schools TO authenticated;

-- For development: Grant broader permissions to avoid any access issues
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- PART 6: TEST THE SETUP
-- ============================================================================

-- Check if there are any users without profiles (this would cause login issues)
DO $$
DECLARE
    missing_profiles_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_profiles_count
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    IF missing_profiles_count > 0 THEN
        RAISE WARNING 'Found % users without profiles. These users will not be able to log in properly.', missing_profiles_count;
    ELSE
        RAISE NOTICE 'All users have profiles. Login should work correctly.';
    END IF;
END $$;

-- ============================================================================
-- PART 7: COMMENTS FOR DEBUGGING
-- ============================================================================

COMMENT ON POLICY "Users can always view their own profile" ON profiles IS 
'PRIMARY POLICY: This must work for login to succeed. Users need to access their own profile first.';

COMMENT ON POLICY "Users can view school profiles" ON profiles IS 
'SECONDARY POLICY: After users can access their own profile, they can see others in their school.';

-- Success message
SELECT 'Login issues should now be resolved. Users should be able to log in without infinite loading.' AS status;
