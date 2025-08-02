-- Fix RLS policies for Kennedy Management System
-- This script removes conflicting policies and creates simple, permissive ones for development

-- Remove all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own school" ON schools;
DROP POLICY IF EXISTS "Owners can update their school" ON schools;
DROP POLICY IF EXISTS "Users can view profiles in their school" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Owners and managers can invite users" ON profiles;
DROP POLICY IF EXISTS "Users can view invitations for their school" ON invitations;
DROP POLICY IF EXISTS "Owners and managers can create invitations" ON invitations;
DROP POLICY IF EXISTS "Users can access students in their school" ON students;
DROP POLICY IF EXISTS "Users can access teachers in their school" ON teachers;
DROP POLICY IF EXISTS "Users can access courses in their school" ON course_instances;
DROP POLICY IF EXISTS "Users can access student payments in their school" ON student_payments;
DROP POLICY IF EXISTS "Managers and owners can access teacher payouts" ON teacher_payouts;
DROP POLICY IF EXISTS "Users can access attendance in their school" ON attendance;
DROP POLICY IF EXISTS "Managers and owners can access revenue" ON revenue;
DROP POLICY IF EXISTS "Users can access archive requests in their school" ON archive_requests;
DROP POLICY IF EXISTS "Allow all operations on revenue" ON revenue;
DROP POLICY IF EXISTS "Allow all operations on teacher_payouts" ON teacher_payouts;
DROP POLICY IF EXISTS "Allow all operations on student_payments" ON student_payments;
DROP POLICY IF EXISTS "Allow all operations on archive_requests" ON archive_requests;
DROP POLICY IF EXISTS "Allow all operations on attendance" ON attendance;

-- Create simple, permissive policies for development
-- These can be tightened later for production

-- Schools - allow authenticated users to access
CREATE POLICY "Allow all operations on schools" ON schools
    FOR ALL TO authenticated USING (true);

-- Profiles - allow authenticated users to access
CREATE POLICY "Allow all operations on profiles" ON profiles
    FOR ALL TO authenticated USING (true);

-- Invitations - allow authenticated users to access  
CREATE POLICY "Allow all operations on invitations" ON invitations
    FOR ALL TO authenticated USING (true);

-- Students - allow authenticated users to access
CREATE POLICY "Allow all operations on students" ON students
    FOR ALL TO authenticated USING (true);

-- Teachers - allow authenticated users to access
CREATE POLICY "Allow all operations on teachers" ON teachers
    FOR ALL TO authenticated USING (true);

-- Course templates - allow authenticated users to access
CREATE POLICY "Allow all operations on course_templates" ON course_templates
    FOR ALL TO authenticated USING (true);

-- Course instances - allow authenticated users to access
CREATE POLICY "Allow all operations on course_instances" ON course_instances
    FOR ALL TO authenticated USING (true);

-- Student payments - allow authenticated users to access
CREATE POLICY "Allow all operations on student_payments" ON student_payments
    FOR ALL TO authenticated USING (true);

-- Teacher payouts - allow authenticated users to access
CREATE POLICY "Allow all operations on teacher_payouts" ON teacher_payouts
    FOR ALL TO authenticated USING (true);

-- Revenue - allow authenticated users to access
CREATE POLICY "Allow all operations on revenue" ON revenue
    FOR ALL TO authenticated USING (true);

-- Legacy payments - allow authenticated users to access
CREATE POLICY "Allow all operations on payments" ON payments
    FOR ALL TO authenticated USING (true);

-- Attendance - allow authenticated users to access
CREATE POLICY "Allow all operations on attendance" ON attendance
    FOR ALL TO authenticated USING (true);

-- Archive requests - allow authenticated users to access
CREATE POLICY "Allow all operations on archive_requests" ON archive_requests
    FOR ALL TO authenticated USING (true);

-- Legacy users - allow authenticated users to access
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL TO authenticated USING (true);

-- Verify RLS is enabled on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS policies fixed successfully! All tables now have simple, permissive policies for authenticated users.' as status;
