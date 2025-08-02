# Fix Authentication Issues - Step by Step Instructions

## Current Problems Identified:
1. **Infinite Loading**: Authentication checks are timing out due to missing database columns and RLS policies
2. **Missing Email Confirmation**: Supabase email settings are not configured properly
3. **Login Button Animation**: Silent failures due to database schema mismatches
4. **Missing Profile Creation**: User registration trigger is failing

## Step-by-Step Fix:

### Step 1: Apply Complete Database Fix
1. Open Supabase SQL Editor
2. **IMPORTANT**: Delete all previous SQL executions from the history
3. Copy and paste the entire content from `complete-database-fix.sql`
4. Execute the script
5. You should see a success message at the end

### Step 2: Disable Email Confirmation (for Development)
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "User Signups", set:
   - **Enable email confirmations**: OFF (disable this)
   - **Enable phone confirmations**: OFF (disable this)
3. Under "Email Auth", set:
   - **Enable email confirmations**: OFF (disable this)
4. Save the settings

### Step 3: Test the Complete Flow

#### Test 1: School Creation and Owner Signup
1. Go to your website
2. Navigate to `/auth/create-school`
3. Create a new school with these details:
   ```
   School Name: Test Academy
   Address: 123 Test St
   Phone: +213 555 0123
   Email: test@academy.com
   
   Owner Name: John Admin
   Email: admin@testacademy.com
   Phone: +213 555 0124
   Password: TestPass123!
   ```
4. Submit the form
5. **Expected Result**: Should redirect to manager dashboard without asking for email confirmation

#### Test 2: Login with Created Account
1. Go to `/auth/login`
2. Enter the owner credentials:
   ```
   Email: admin@testacademy.com
   Password: TestPass123!
   ```
3. Click login
4. **Expected Result**: Should login successfully and redirect to manager dashboard

#### Test 3: Dashboard Loading
1. After successful login, check the manager dashboard
2. **Expected Result**: Should load quickly without infinite loading
3. Try navigating to different tabs (Students, Teachers, Courses)
4. **Expected Result**: All tabs should load and display empty data tables

### Step 4: Verify Database Changes
If you want to verify the database was set up correctly:

1. Go to Supabase → Table Editor
2. Check that these tables exist with the correct columns:
   - `schools` (with id, name, address, etc.)
   - `profiles` (with id, school_id, role, full_name, etc.)
   - `students` (with id, school_id, name, archived, etc.)
   - `teachers` (with id, school_id, name, subjects, archived, etc.)
   - `course_instances` (with id, school_id, teacher_id, etc.)

### Step 5: Test Adding Data
Once authentication works:

1. Try adding a student
2. Try adding a teacher
3. Try creating a course
4. **Expected Result**: All operations should work without errors

## If You Still Have Issues:

### Issue: Still getting infinite loading
**Solution**: 
1. Open browser developer tools (F12)
2. Check Console tab for error messages
3. Clear browser cache and cookies
4. Try in incognito/private mode

### Issue: Database errors during SQL execution
**Solution**:
1. In Supabase SQL Editor, click the trash icon to delete all previous queries
2. Run the `complete-database-fix.sql` script again
3. If specific errors occur, share the exact error message

### Issue: Login still doesn't work
**Solution**:
1. Check that email confirmation is disabled in Supabase Auth settings
2. Try creating a new test account
3. Check browser network tab for failed requests

### Issue: "Profile not found" errors
**Solution**:
1. The trigger function should automatically create profiles
2. If it doesn't work, you can manually create a profile in Supabase:
   ```sql
   INSERT INTO profiles (id, school_id, role, full_name, is_active)
   VALUES ('your-user-id', 'your-school-id', 'owner', 'Your Name', true);
   ```

## Success Indicators:
✅ Website loads quickly (under 3 seconds)
✅ School creation works without email confirmation page
✅ Login works with newly created accounts
✅ Manager dashboard loads and displays tabs
✅ No infinite loading screens
✅ No console errors in browser developer tools

## Additional Notes:
- The fix includes permissive RLS policies for development
- For production, you should re-enable email confirmation and tighten RLS policies
- All database operations are now scoped to school_id for multi-tenancy
- The authentication trigger handles both owner creation and invitation-based signups
