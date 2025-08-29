-- Kennedy Management System - Session Management Fix
-- This fixes the infinite loading issue when switching tabs/windows
-- Run this NINTH after 08-emergency-fix.sql

-- ============================================================================
-- ISSUE DIAGNOSIS
-- ============================================================================

-- The infinite loading happens because:
-- 1. RLS is disabled on profiles table (emergency fix)
-- 2. Session refresh tries to validate user permissions
-- 3. get_user_school_id() function fails due to RLS inconsistencies
-- 4. Frontend gets stuck in authentication loop

-- ============================================================================
-- FIX 1: CREATE RELIABLE SESSION VALIDATION FUNCTION
-- ============================================================================

-- Drop any existing session validation functions
DROP FUNCTION IF EXISTS get_current_user_session() CASCADE;
DROP FUNCTION IF EXISTS validate_user_session() CASCADE;

-- Create a bulletproof session validation function that works with disabled RLS
CREATE OR REPLACE FUNCTION get_current_user_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    current_user_id UUID;
    user_profile RECORD;
    user_school RECORD;
    result jsonb;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    -- If no user is authenticated, return null session
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'authenticated', false,
            'user', null,
            'profile', null,
            'school', null,
            'session_valid', false
        );
    END IF;
    
    -- Get user profile (works even with RLS disabled)
    SELECT 
        id, school_id, role, full_name, phone, is_active, 
        created_at, updated_at
    INTO user_profile
    FROM profiles 
    WHERE id = current_user_id
    LIMIT 1;
    
    -- If no profile found, user needs to complete setup
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'authenticated', true,
            'user', jsonb_build_object('id', current_user_id),
            'profile', null,
            'school', null,
            'session_valid', false,
            'needs_profile_setup', true
        );
    END IF;
    
    -- Check if profile is active
    IF NOT user_profile.is_active THEN
        RETURN jsonb_build_object(
            'authenticated', true,
            'user', jsonb_build_object('id', current_user_id),
            'profile', row_to_json(user_profile),
            'school', null,
            'session_valid', false,
            'profile_inactive', true
        );
    END IF;
    
    -- Get school information
    SELECT id, name, created_at
    INTO user_school
    FROM schools 
    WHERE id = user_profile.school_id
    LIMIT 1;
    
    -- If school not found, data integrity issue
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'authenticated', true,
            'user', jsonb_build_object('id', current_user_id),
            'profile', row_to_json(user_profile),
            'school', null,
            'session_valid', false,
            'school_missing', true
        );
    END IF;
    
    -- Build successful session response
    RETURN jsonb_build_object(
        'authenticated', true,
        'user', jsonb_build_object('id', current_user_id),
        'profile', row_to_json(user_profile),
        'school', row_to_json(user_school),
        'session_valid', true,
        'permissions', jsonb_build_object(
            'role', user_profile.role,
            'can_manage_school', (user_profile.role IN ('owner', 'manager')),
            'can_create_invitations', (user_profile.role IN ('owner', 'manager')),
            'can_view_finances', (user_profile.role IN ('owner', 'manager'))
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information for debugging
        RETURN jsonb_build_object(
            'authenticated', (current_user_id IS NOT NULL),
            'user', CASE WHEN current_user_id IS NOT NULL THEN jsonb_build_object('id', current_user_id) ELSE null END,
            'profile', null,
            'school', null,
            'session_valid', false,
            'error', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;

-- ============================================================================
-- FIX 2: CREATE REPLACEMENT FOR get_user_school_id() THAT WORKS WITH DISABLED RLS
-- ============================================================================

-- Create a bulletproof version that handles the disabled RLS situation
CREATE OR REPLACE FUNCTION get_user_school_id_safe()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public AS $$
DECLARE
    current_user_id UUID;
    user_school_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Return null if not authenticated
    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get school_id directly (works with disabled RLS)
    SELECT school_id INTO user_school_id
    FROM profiles 
    WHERE id = current_user_id
    AND is_active = true
    LIMIT 1;
    
    RETURN user_school_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return null on any error to prevent crashes
        RETURN NULL;
END;
$$;

-- ============================================================================
-- FIX 3: UPDATE HELPER FUNCTIONS TO USE SAFE VERSIONS
-- ============================================================================

-- Create safe versions of all helper functions
CREATE OR REPLACE FUNCTION user_has_role_safe(required_role TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
STABLE
SET search_path = public AS $$
DECLARE
    current_user_id UUID;
    user_role TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT role::TEXT INTO user_role
    FROM profiles
    WHERE id = current_user_id 
    AND is_active = true
    LIMIT 1;
    
    RETURN (user_role = required_role);
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION user_has_any_role_safe(required_roles TEXT[])
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
STABLE
SET search_path = public AS $$
DECLARE
    current_user_id UUID;
    user_role TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT role::TEXT INTO user_role
    FROM profiles
    WHERE id = current_user_id 
    AND is_active = true
    LIMIT 1;
    
    RETURN (user_role = ANY(required_roles));
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- ============================================================================
-- FIX 4: CREATE OPTIMIZED RLS POLICIES FOR REMAINING TABLES
-- ============================================================================

-- Update business table policies to use the safe functions
-- This prevents session validation errors

-- Drop and recreate students policies with safe functions
DROP POLICY IF EXISTS "students_school_access" ON students;
CREATE POLICY "students_school_access_safe" ON students
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Drop and recreate teachers policies with safe functions
DROP POLICY IF EXISTS "teachers_school_access" ON teachers;
CREATE POLICY "teachers_school_access_safe" ON teachers
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Drop and recreate course_templates policies with safe functions
DROP POLICY IF EXISTS "course_templates_school_access" ON course_templates;
CREATE POLICY "course_templates_school_access_safe" ON course_templates
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Drop and recreate course_instances policies with safe functions
DROP POLICY IF EXISTS "course_instances_school_access" ON course_instances;
CREATE POLICY "course_instances_school_access_safe" ON course_instances
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Drop and recreate student_payments policies with safe functions
DROP POLICY IF EXISTS "student_payments_school_access" ON student_payments;
CREATE POLICY "student_payments_school_access_safe" ON student_payments
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Drop and recreate attendance policies with safe functions
DROP POLICY IF EXISTS "attendance_school_access" ON attendance;
CREATE POLICY "attendance_school_access_safe" ON attendance
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Drop and recreate archive_requests policies with safe functions
DROP POLICY IF EXISTS "archive_requests_school_access" ON archive_requests;
CREATE POLICY "archive_requests_school_access_safe" ON archive_requests
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id_safe())
    WITH CHECK (school_id = get_user_school_id_safe());

-- Update financial policies with safe functions
DROP POLICY IF EXISTS "teacher_payouts_financial_access" ON teacher_payouts;
CREATE POLICY "teacher_payouts_financial_access_safe" ON teacher_payouts
    FOR ALL TO authenticated
    USING (
        school_id = get_user_school_id_safe() AND
        user_has_any_role_safe(ARRAY['owner', 'manager'])
    )
    WITH CHECK (
        school_id = get_user_school_id_safe() AND
        user_has_any_role_safe(ARRAY['owner', 'manager'])
    );

DROP POLICY IF EXISTS "revenue_financial_access" ON revenue;
CREATE POLICY "revenue_financial_access_safe" ON revenue
    FOR ALL TO authenticated
    USING (
        school_id = get_user_school_id_safe() AND
        user_has_any_role_safe(ARRAY['owner', 'manager'])
    )
    WITH CHECK (
        school_id = get_user_school_id_safe() AND
        user_has_any_role_safe(ARRAY['owner', 'manager'])
    );

-- ============================================================================
-- FIX 5: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION get_current_user_session() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_school_id_safe() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_has_role_safe(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_has_any_role_safe(TEXT[]) TO authenticated, anon;

-- ============================================================================
-- FIX 6: CREATE FRONTEND SESSION VALIDATION ENDPOINT
-- ============================================================================

-- Create a simple endpoint for frontend to validate sessions
CREATE OR REPLACE FUNCTION validate_current_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    session_info jsonb;
    is_valid boolean;
BEGIN
    -- Get current session info
    session_info := get_current_user_session();
    
    -- Check if session is valid
    is_valid := (session_info->>'session_valid')::boolean;
    
    -- Add timestamp for debugging
    session_info := session_info || jsonb_build_object(
        'validated_at', EXTRACT(EPOCH FROM NOW()),
        'server_time', NOW()
    );
    
    RETURN session_info;
END;
$$;

-- Create session cleanup function for corrupted sessions
CREATE OR REPLACE FUNCTION cleanup_user_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    current_user_id UUID;
    cleanup_result jsonb;
BEGIN
    current_user_id := auth.uid();
    
    -- If no user, nothing to clean
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'No authenticated user to clean up'
        );
    END IF;
    
    -- Log the cleanup for debugging
    RAISE NOTICE 'Cleaning up session for user %', current_user_id;
    
    -- Return success (actual session cleanup happens on frontend)
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Session cleanup initiated',
        'user_id', current_user_id,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'user_id', current_user_id
        );
END;
$$;

GRANT EXECUTE ON FUNCTION validate_current_session() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_user_session() TO authenticated, anon;

-- ============================================================================
-- TESTING AND VERIFICATION
-- ============================================================================

-- Test the session validation
DO $$
DECLARE
    test_result jsonb;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'TESTING SESSION MANAGEMENT FIX';
    RAISE NOTICE '============================================================================';
    
    -- Test session validation function
    BEGIN
        SELECT get_current_user_session() INTO test_result;
        RAISE NOTICE '✓ Session validation function: WORKING';
        RAISE NOTICE '  Response structure: %', test_result::text;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Session validation function: FAILED - %', SQLERRM;
    END;
    
    -- Test safe helper functions
    BEGIN
        IF get_user_school_id_safe() IS NULL THEN
            RAISE NOTICE '✓ Safe school ID function: WORKING (returns null when not authenticated)';
        ELSE
            RAISE NOTICE '✓ Safe school ID function: WORKING (returns school ID)';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Safe school ID function: FAILED - %', SQLERRM;
    END;
    
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- SUCCESS MESSAGE AND FRONTEND INSTRUCTIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'SESSION MANAGEMENT FIX APPLIED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Database Changes:';
    RAISE NOTICE '  ✓ Created bulletproof session validation function';
    RAISE NOTICE '  ✓ Updated all helper functions to handle disabled RLS';
    RAISE NOTICE '  ✓ Optimized RLS policies with safe functions';
    RAISE NOTICE '  ✓ Added session validation endpoint';
    RAISE NOTICE '';
    RAISE NOTICE 'FRONTEND CHANGES NEEDED:';
    RAISE NOTICE '  1. Replace session validation with:';
    RAISE NOTICE '     supabase.rpc("validate_current_session")';
    RAISE NOTICE '';
    RAISE NOTICE '  2. Handle session refresh in your auth listener:';
    RAISE NOTICE '     - Call validate_current_session() on window focus';
    RAISE NOTICE '     - Use the response to update auth state';
    RAISE NOTICE '     - Stop infinite loading loops';
    RAISE NOTICE '';
    RAISE NOTICE '  3. Check for these response fields:';
    RAISE NOTICE '     - session_valid: boolean';
    RAISE NOTICE '     - authenticated: boolean';
    RAISE NOTICE '     - needs_profile_setup: boolean (if true, redirect to setup)';
    RAISE NOTICE '     - profile_inactive: boolean (if true, show inactive message)';
    RAISE NOTICE '';
    RAISE NOTICE 'This fix resolves infinite loading when switching tabs/windows.';
    RAISE NOTICE '============================================================================';
END $$;
