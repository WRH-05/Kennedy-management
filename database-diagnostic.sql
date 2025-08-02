-- Database Diagnostic Script for Kennedy Management System
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if tables exist and RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('schools', 'profiles', 'students', 'teachers', 'invitations')
ORDER BY tablename;

-- 2. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check if any profiles exist
SELECT 
    COUNT(*) as profile_count,
    COUNT(CASE WHEN school_id IS NOT NULL THEN 1 END) as profiles_with_school
FROM profiles;

-- 4. Check if any schools exist
SELECT COUNT(*) as school_count FROM schools;

-- 5. Check user authentication status (this will show the current session info)
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'Not authenticated'
        ELSE 'Authenticated'
    END as auth_status;

-- 6. Test profile access for current user (if authenticated)
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.school_id,
    s.name as school_name
FROM profiles p
LEFT JOIN schools s ON s.id = p.school_id
WHERE p.id = auth.uid();

-- 7. Check if there are any profiles that can be accessed
SELECT 
    COUNT(*) as accessible_profiles
FROM profiles
WHERE true; -- This should work with permissive RLS policies
